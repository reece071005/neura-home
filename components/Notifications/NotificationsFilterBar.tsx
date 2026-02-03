import React from "react";
import { View, Text, Pressable } from "react-native";
import { NotificationSeverity, NotificationType } from "./types";

export type NotificationsFilter = {
    severity: "all" | NotificationSeverity;
    type: "all" | NotificationType;
    unreadOnly: boolean;
};

function Chip({
                  label,
                  active,
                  onPress,
              }: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: active ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.12)",
                marginRight: 8,
                marginBottom: 8,
            }}
        >
            <Text style={{ color: "white", fontSize: 12, fontWeight: active ? "700" : "600" }}>
                {label}
            </Text>
        </Pressable>
    );
}

export function NotificationsFilterBar({
                                           value,
                                           onChange,
                                       }: {
    value: NotificationsFilter;
    onChange: (next: NotificationsFilter) => void;
}) {
    return (
        <View>
            <Text style={{ color: "rgba(255,255,255,0.7)", marginBottom: 8, fontSize: 12 }}>
                Filters
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Chip
                    label={value.unreadOnly ? "Unread: ON" : "Unread: OFF"}
                    active={value.unreadOnly}
                    onPress={() => onChange({ ...value, unreadOnly: !value.unreadOnly })}
                />

                <Chip
                    label={`Severity: ${value.severity}`}
                    active={value.severity !== "all"}
                    onPress={() =>
                        onChange({
                            ...value,
                            severity:
                                value.severity === "all"
                                    ? "warning"
                                    : value.severity === "warning"
                                        ? "critical"
                                        : value.severity === "critical"
                                            ? "info"
                                            : "all",
                        })
                    }
                />

                <Chip
                    label={`Type: ${value.type}`}
                    active={value.type !== "all"}
                    onPress={() =>
                        onChange({
                            ...value,
                            type:
                                value.type === "all"
                                    ? "automation"
                                    : value.type === "automation"
                                        ? "package"
                                        : value.type === "package"
                                            ? "device"
                                            : value.type === "device"
                                                ? "security"
                                                : value.type === "security"
                                                    ? "system"
                                                    : "all",
                        })
                    }
                />

                <Chip
                    label="Reset"
                    active={false}
                    onPress={() => onChange({ severity: "all", type: "all", unreadOnly: false })}
                />
            </View>
        </View>
    );
}