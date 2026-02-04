import React, { useMemo, useRef, useState } from "react";
import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
        case "automation":
            return "bolt";
        case "package":
            return "inventory-2";
        case "device":
            return "devices";
        case "security":
            return "shield";
        default:
            return "info";
    }
};

const severityPill = (severity: NotificationSeverity) => {
    switch (severity) {
        case "critical":
            return { bg: "bg-red-500/12", border: "border-red-500/30", text: "text-red-700", label: "CRITICAL" };
        case "warning":
            return { bg: "bg-amber-500/12", border: "border-amber-500/30", text: "text-amber-800", label: "WARNING" };
        default:
            return { bg: "bg-blue-500/12", border: "border-blue-500/30", text: "text-blue-800", label: "INFO" };
    }
};

const formatTime = (iso: string) => new Date(iso).toLocaleString();

const headerTextShadow = {
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
};

/* ---------------- UI Components ---------------- */

const SectionHeader = ({
                           icon,
                           title,
                       }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
}) => {
    return (
        <View className="flex-row items-center gap-2 mt-6 mb-3">
            <MaterialIcons name={icon} size={22} color="white" />
            <Text style={headerTextShadow} className="text-white font-extrabold text-lg">
                {title}
            </Text>
        </View>
    );
};

function NotificationCard({
                              item,
                              isDraggingRef,
                              onMarkRead,
                          }: {
    item: NotificationItem;
    isDraggingRef: React.MutableRefObject<boolean>;
    onMarkRead: (id: string) => void;
}) {
    const pill = severityPill(item.severity);

    const onPress = () => {
        if (isDraggingRef.current) return;

        onMarkRead(item.id);

        if (item.action?.route) {
            router.push({
                pathname: item.action.route as any,
                params: item.action.params ?? {},
            });
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            delayPressIn={140}
            pressRetentionOffset={{ top: 22, left: 22, right: 22, bottom: 22 }}
        >
            <View
                className="bg-white rounded-2xl px-4 py-4 border border-black/10"
                style={{
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 4, // Android
                }}
            >
                <View className="flex-row items-start gap-3">
                    <View className="w-10 h-10 rounded-xl items-center justify-center bg-black/5">
                        <MaterialIcons name={item.icon} size={20} color="#111827" />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-start justify-between gap-3">
                            <Text className="text-black font-extrabold text-[15px] flex-1">
                                {item.title}
                            </Text>

                            <View className={`px-2 py-1 rounded-full border ${pill.bg} ${pill.border}`}>
                                <Text className={`text-[10px] font-extrabold ${pill.text}`}>
                                    {pill.label}
                                </Text>
                            </View>
                        </View>

                        <Text className="text-zinc-700 mt-2 leading-[18px]">
                            {item.message}
                        </Text>

                        <View className="flex-row items-center justify-between mt-4">
                            <Text className="text-zinc-500 text-xs">
                                {formatTime(item.createdAt)}
                            </Text>

                            {item.action?.label ? (
                                <Text className="text-black font-extrabold text-xs">
                                    {item.action.label} →
                                </Text>
                            ) : !item.read ? (
                                <Text className="text-black font-extrabold text-xs">New</Text>
                            ) : null}
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

/* ---------------- Screen ---------------- */

export default function Notifications() {
    const insets = useSafeAreaInsets();

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
                message: "“Night Mode” will arm doors, dim lights, and enable camera alerts at 11:00 PM.",
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
                message: "Main Door was unlocked at 12:30 PM by ‘Home Owner’.",
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
    const unreadCount = items.filter((n) => !n.read).length;

    // Supposed to prevent accidental opens while dragging
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
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 140);
    };

    const markRead = (id: string) => {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const markAllRead = () => {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // Header Alignment
    const topPad = Math.max(insets.top + 6, 14);
    const headerLeftPad = 56;

    return (
        <LinearGradient
            colors={["#3DC4E0", "#4985EE"]}
            locations={[0, 0.44]}
            style={{ flex: 1 }}
        >
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 24,
                    paddingTop: topPad,
                }}
                onScrollBeginDrag={onScrollBeginDrag}
                onScroll={onScroll}
                onScrollEndDrag={onScrollEndDrag}
                scrollEventThrottle={16}
            >
                <View className="px-4" style={{ gap: 8 }}>
                    {/* Header */}
                    <View className="flex-row items-start justify-between" style={{ paddingLeft: headerLeftPad }}>
                        <View>
                            <Text style={headerTextShadow} className="text-white font-extrabold text-2xl">
                                Notifications
                            </Text>
                            <Text style={headerTextShadow} className="text-white/95 mt-1 text-sm font-semibold">
                                {unreadCount > 0
                                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                                    : "You're all caught up"}
                            </Text>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={markAllRead}
                            delayPressIn={80}
                            className="px-3 py-2 rounded-2xl bg-white/92 border border-white/35"
                            style={{
                                shadowOpacity: 0.12,
                                shadowRadius: 12,
                                shadowOffset: { width: 0, height: 8 },
                            }}
                        >
                            <Text className="text-black font-extrabold text-xs">Mark all read</Text>
                        </TouchableOpacity>
                    </View>

                    <SectionHeader icon="notifications" title="Latest Updates" />

                    <View className="gap-4">
                        {items.map((n) => (
                            <NotificationCard key={n.id} item={n} isDraggingRef={isDraggingRef} onMarkRead={markRead} />
                        ))}
                    </View>

                    <View className="h-8" />
                </View>
            </ScrollView>
        </LinearGradient>
    );
}