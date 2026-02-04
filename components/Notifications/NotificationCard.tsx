import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { NotificationItem } from "./types";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

function iconForType(type: NotificationItem["type"]): keyof typeof MaterialIcons.glyphMap {
    switch (type) {
        case "automation":
            return "bolt";
        case "package":
            return "inventory-2";
        case "device":
            return "devices";
        case "security":
            return "shield";
        case "system":
        default:
            return "info";
    }
}

function badgeForSeverity(severity: NotificationItem["severity"]) {
    switch (severity) {
        case "critical":
            return { label: "Critical", bg: "rgba(255,50,50,0.18)", border: "rgba(255,50,50,0.35)" };
        case "warning":
            return { label: "Warning", bg: "rgba(255,190,60,0.18)", border: "rgba(255,190,60,0.35)" };
        case "info":
        default:
            return { label: "Info", bg: "rgba(120,170,255,0.18)", border: "rgba(120,170,255,0.35)" };
    }
}

function formatTime(iso: string) {
    // Backend can send localized strings later
    const d = new Date(iso);
    return d.toLocaleString();
}

export function NotificationCard({
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