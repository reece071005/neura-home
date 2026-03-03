import React, { useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

/* ---------------- Types ---------------- */

type NotificationType = "automation" | "package" | "device" | "security" | "system";
type NotificationSeverity = "info" | "warning" | "critical";

type NotificationItem = {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  action?: {
    label: string;
    route?: string;
    params?: Record<string, any>;
  };
};

/* ---------------- Helpers ---------------- */

const typeToIcon = (type: NotificationType): keyof typeof MaterialIcons.glyphMap => {
  switch (type) {
    case "automation": return "bolt";
    case "package":    return "inventory-2";
    case "device":     return "devices";
    case "security":   return "shield";
    default:           return "info";
  }
};

const severityConfig = (severity: NotificationSeverity) => {
  switch (severity) {
    case "critical": return { dot: "#EF4444", label: "Critical", labelColor: "#EF4444" };
    case "warning":  return { dot: "#F59E0B", label: "Warning",  labelColor: "#B45309" };
    default:         return { dot: "#3B82F6", label: "Info",     labelColor: "#1D4ED8" };
  }
};

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ---------------- Notification Card ---------------- */

function NotificationCard({
  item,
  isDraggingRef,
  onMarkRead,
}: {
  item: NotificationItem;
  isDraggingRef: React.MutableRefObject<boolean>;
  onMarkRead: (id: string) => void;
}) {
  const sev = severityConfig(item.severity);

  const onPress = () => {
    if (isDraggingRef.current) return;
    onMarkRead(item.id);
    if (item.action?.route) {
      router.push({ pathname: item.action.route as any, params: item.action.params ?? {} });
    }
  };

  return (
    <Pressable
      onPress={onPress}
      delayLongPress={140}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: item.read ? "#E5E7EB" : "#D1D5DB",
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {/* Unread indicator strip */}
        <View
          style={{
            width: 3,
            backgroundColor: item.read ? "transparent" : sev.dot,
          }}
        />

        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            {/* Icon */}
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MaterialIcons name={item.icon} size={18} color="#374151" />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: item.read ? "500" : "700",
                    color: "#111827",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {/* Time */}
                <Text style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>
                  {formatRelativeTime(item.createdAt)}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  marginTop: 3,
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {item.message}
              </Text>

              {/* Footer */}
              {(item.action?.label || item.severity !== "info") && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  {/* Severity pill */}
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 999,
                      backgroundColor: "#F3F4F6",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: sev.labelColor }}>
                      {sev.label}
                    </Text>
                  </View>

                  {item.action?.label && (
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>
                      {item.action.label} →
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------------- Screen ---------------- */

export default function Notifications() {
  const seed = useMemo<NotificationItem[]>(() => {
    const now = Date.now();
    const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

    return [
      {
        id: "n1",
        type: "automation",
        severity: "info",
        icon: typeToIcon("automation"),
        title: "Automation created",
        message: "Night Mode will arm doors, dim lights, and enable camera alerts at 11:00 PM.",
        createdAt: iso(1000 * 60 * 10),
        action: { label: "View automation", route: "/(drawer)/automations" },
      },
      {
        id: "n2",
        type: "package",
        severity: "warning",
        icon: typeToIcon("package"),
        title: "Package at the door",
        message: "Front Door camera detected a package. Tap to review the clip and confirm delivery.",
        createdAt: iso(1000 * 60 * 35),
        action: { label: "Open cameras", route: "/(drawer)/(tabs)/cameraDashboard" },
      },
      {
        id: "n3",
        type: "device",
        severity: "critical",
        icon: typeToIcon("device"),
        title: "Device needs attention",
        message: "Living Room camera is offline. Check Wi-Fi or power and try reconnecting.",
        createdAt: iso(1000 * 60 * 90),
        action: { label: "Manage devices", route: "/(drawer)/devices" },
      },
      {
        id: "n4",
        type: "security",
        severity: "info",
        icon: typeToIcon("security"),
        title: "Door unlocked",
        message: "Main Door was unlocked at 12:30 PM by 'Home Owner'.",
        createdAt: iso(1000 * 60 * 140),
      },
      {
        id: "n5",
        type: "system",
        severity: "info",
        icon: typeToIcon("system"),
        title: "App update applied",
        message: "Performance improvements and stability fixes are now active.",
        createdAt: iso(1000 * 60 * 240),
        read: true,
      },
    ];
  }, []);

  const [items, setItems] = useState(seed);

  const unread = items.filter((n) => !n.read);
  const read   = items.filter((n) => n.read);

  const isDraggingRef = useRef(false);
  const lastYRef = useRef(0);

  const onScrollBeginDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDraggingRef.current = true;
    lastYRef.current = e.nativeEvent.contentOffset.y;
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (Math.abs(y - lastYRef.current) > 2) isDraggingRef.current = true;
    lastYRef.current = y;
  };
  const onScrollEndDrag = () => {
    setTimeout(() => { isDraggingRef.current = false; }, 140);
  };

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={{ alignItems: "center", paddingTop: 3, paddingBottom: 18 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Notifications</Text>
        {unread.length > 0 && (
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            {unread.length} unread
          </Text>
        )}
      </View>

      <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
      >
        {/* Unread section */}
        {unread.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
                New
              </Text>
              <Pressable onPress={markAllRead} hitSlop={10}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280" }}>
                  Mark all read
                </Text>
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {unread.map((n) => (
                <NotificationCard
                  key={n.id}
                  item={n}
                  isDraggingRef={isDraggingRef}
                  onMarkRead={markRead}
                />
              ))}
            </View>
          </View>
        )}

        {/* Read / earlier section */}
        {read.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
              Earlier
            </Text>
            <View style={{ gap: 10 }}>
              {read.map((n) => (
                <NotificationCard
                  key={n.id}
                  item={n}
                  isDraggingRef={isDraggingRef}
                  onMarkRead={markRead}
                />
              ))}
            </View>
          </View>
        )}

        {/* All read empty state */}
        {unread.length === 0 && read.length === 0 && (
          <View style={{ paddingTop: 80, alignItems: "center", paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              You're all caught up
            </Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 6, textAlign: "center" }}>
              No notifications right now.
            </Text>
          </View>
        )}

        {unread.length === 0 && read.length > 0 && (
          <View style={{ alignItems: "center", paddingTop: 20 }}>
            <Text style={{ fontSize: 13, color: "#9CA3AF" }}>You're all caught up</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}