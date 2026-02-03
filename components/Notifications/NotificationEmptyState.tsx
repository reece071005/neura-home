import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export function NotificationEmptyState() {
    return (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
            <View
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.12)",
                    marginBottom: 12,
                }}
            >
                <MaterialIcons name="notifications-none" size={26} color="white" />
            </View>

            <Text style={{ color: "white", fontSize: 16, fontWeight: "800" }}>No notifications</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6, textAlign: "center", paddingHorizontal: 22 }}>
                You’ll see app updates, automations, device alerts, and package events here.
            </Text>
        </View>
    );
}