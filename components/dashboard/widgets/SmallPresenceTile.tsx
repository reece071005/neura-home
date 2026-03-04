// components/dashboard/widgets/SmallPresenceTile.tsx
import React from "react";
import { View, Text } from "react-native";
import Card from "@/components/dashboard/Card";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  detected: boolean;
};

export default function SmallPresenceTile({ title, detected }: Props) {
  const statusLabel = detected ? "Detected" : "Clear";
  const color = detected ? "#F4C400" : "#7A7A7A";

  return (
    <Card variant="small">
      <View className="flex-1 flex-row items-center">
        <View className="w-[32px] mr-2 items-center justify-center">
          <MaterialCommunityIcons
            name={detected ? "motion-sensor" : "motion-sensor-off"}
            size={30}
            color={color}
          />
        </View>

        <View className="flex-1">
          <Text numberOfLines={1} className="text-body font-medium text-black">
            {title}
          </Text>
          <Text className="text-subtext font-medium" style={{ color }}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </Card>
  );
}