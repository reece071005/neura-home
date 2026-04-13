//aiNotificationDetail.tsx
import React, { useEffect, useState } from "react";
import {ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getCachedAiNotification, getAiNotificationById, AiNotification } from "@/lib/api/notifications/aiNotifications";

// Helpers
const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatEntityId = (entityId: string) => {
  const [domain, ...nameParts] = entityId.split(".");
  const name = nameParts
    .join(".")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const domainLabel = domain.charAt(0).toUpperCase() + domain.slice(1);
  return `${domainLabel} - ${name}`;
};

const formatActionType = (actionType: string) => {
  return actionType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Detail Row
function DetailRow({
  icon,
  label,
  value,
  iconColor = "#374151",
  iconBg = "#F3F4F6",
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialIcons name={icon} size={17} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 1 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, color: "#111827", fontWeight: "500" }} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// Meta Data Section
function MetaDataSection({ meta }: { meta: Record<string, any> }) {
  if (!meta || Object.keys(meta).length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
        Additional Details
      </Text>
      <View
        style={{
          backgroundColor: "#F9FAFB",
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        {Object.entries(meta).map(([key, value], index) => (
          <View
            key={key}
            style={{
              paddingVertical: 8,
              borderBottomWidth: index < Object.keys(meta).length - 1 ? 1 : 0,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 2 }}>
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text style={{ fontSize: 13, color: "#111827", fontWeight: "500" }}>
              {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Screen
export default function AiNotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationId = id ? Number(id) : NaN;
  const hasValidId = Number.isFinite(notificationId);
  const initialCached = Number.isFinite(notificationId)
    ? getCachedAiNotification(notificationId)
    : null;

  const [notification, setNotification] = useState<AiNotification | null>(initialCached);
  const [loading, setLoading] = useState(hasValidId && !initialCached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidId) {
      setLoading(false);
      setError("Invalid notification ID");
      return;
    }

    const cached = getCachedAiNotification(notificationId);
    if (cached) {
      setNotification(cached);
      setLoading(false);
    }

    (async () => {
      try {
        if (!cached) setLoading(true);
        const data = await getAiNotificationById(notificationId);
        setNotification(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load notification");
      } finally {
        setLoading(false);
      }
    })();
  }, [hasValidId, notificationId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !notification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="error-outline" size={40} color="#EF4444" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 12 }}>
            Could not load automation
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4, textAlign: "center" }}>
            {error ?? "Notification not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isExecuted = notification.notification_type === "executed";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="AI Automation" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={{
            backgroundColor: "#EEF2FF",
            paddingHorizontal: 24,
            paddingVertical: 32,
            borderBottomWidth: 1,
            borderBottomColor: "#E0E7FF",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#6366F1",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <MaterialIcons name="auto-awesome" size={32} color="white" />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: isExecuted ? "#DCFCE7" : "#FEF3C7",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: isExecuted ? "#16A34A" : "#D97706",
                }}
              >
                {isExecuted ? "EXECUTED" : "SUGGESTED"}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", lineHeight: 26 }}>
            {notification.message}
          </Text>
        </View>

        {/* Info panel */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <DetailRow
            icon="meeting-room"
            label="Room"
            value={notification.room}
            iconColor="#6366F1"
            iconBg="#EEF2FF"
          />
          <DetailRow
            icon="devices"
            label="Device"
            value={formatEntityId(notification.entity_id)}
            iconColor="#6366F1"
            iconBg="#EEF2FF"
          />
          <DetailRow
            icon="bolt"
            label="Action"
            value={formatActionType(notification.action_type)}
            iconColor="#6366F1"
            iconBg="#EEF2FF"
          />
          <DetailRow
            icon="schedule"
            label={isExecuted ? "Executed at" : "Suggested at"}
            value={formatFullDate(notification.created_at)}
            iconColor="#6366F1"
            iconBg="#EEF2FF"
          />

          {/* Meta data */}
          <MetaDataSection meta={notification.meta} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Back header
function Header({ title = "Back" }: { title?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 8,
      }}
    >
      <Pressable
        onPress={() => router.replace({ pathname: "/notifications/notifications" })}
        android_ripple={{ color: "#E5E7EB", borderless: true }}
        disabled={router.canGoBack() === false}
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <MaterialIcons name="arrow-back" size={24} color="#111827" />
      </Pressable>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>{title}</Text>
    </View>
  );
}