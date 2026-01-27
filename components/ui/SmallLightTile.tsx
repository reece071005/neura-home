// components/ui/SmallLightTile.tsx
import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Card from "@/components/ui/Card";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
    title: string;
    isOn: boolean;
    onPress?: () => void;
    onMenuPress?: () => void;
    showBlueBorder?: boolean;
};

export default function SmallLightTile({title, isOn, onPress, onMenuPress, showBlueBorder = false,}: Props) {
    const statusLabel = isOn ? "On" : "Off";
    const statusColor = useMemo(() => (isOn ? "#F4C400" : "#7A7A7A"), [isOn]);
    const iconColor = useMemo(() => (isOn ? "#F4C400" : "#7A7A7A"), [isOn]);

    return (
        <Card
            variant="small"
            onPress={onPress}
            className={showBlueBorder ? "border border-blue-500" : ""}
        >
            <View className="flex-1 flex-row items-center">
                {/* Left icon */}
                <View className="w-[32px] mr-2 items-center justify-center">
                    <MaterialIcons name="lightbulb" size={32} color={iconColor} />
                </View>

                {/* Title + status */}
                <View className="flex-1">
                    <Text numberOfLines={1} className="text-body font-medium text-black">
                        {title}
                    </Text>
                    <Text
                        className="text-subtext font-medium"
                        style={{ color: statusColor }}
                    >
                        {statusLabel}
                    </Text>
                </View>

                {/* Menu */}
                <View className="w-[28px] items-end justify-center">
                    <Pressable onPress={onMenuPress} hitSlop={10}>
                        <MaterialIcons name="more-vert" size={24} color="#111" />
                    </Pressable>
                </View>
            </View>
        </Card>
    );
}
