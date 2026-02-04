import React from "react";
import { View, Text } from "react-native";

export function NotificationsHeader({
                                        title,
                                        unreadCount,
                                    }: {
    title: string;
    unreadCount: number;
}) {
    return (
        <View
            style={{
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.08)",
            }}
        >
            <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>{title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
            </Text>
        </View>
    );
}