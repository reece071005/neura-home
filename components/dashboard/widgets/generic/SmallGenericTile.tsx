// SmallGenericTile.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "@/components/dashboard/Card";

type Props = {
  title: string;

  subtitle?: string;
  isActive?: boolean;

  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];

  onPress?: () => void;
  showBlueBorder?: boolean;
};

export default function SmallGenericTile({
  title,
  subtitle,
  isActive,
  iconName = "devices-other",
  onPress,
  showBlueBorder = false,
}: Props) {
  const iconColor = useMemo(() => {
    if (typeof isActive !== "boolean") return "#7A7A7A";
    return isActive ? "#4985EE" : "#7A7A7A";
  }, [isActive]);

  const subColor = useMemo(() => {
    if (typeof isActive !== "boolean") return "#7A7A7A";
    return isActive ? "#4985EE" : "#7A7A7A";
  }, [isActive]);

  const label = subtitle ?? (typeof isActive === "boolean" ? (isActive ? "On" : "Off") : "—");

  return (
    <Card
      variant="small"
      onPress={onPress}
      className={showBlueBorder ? "border border-blue-500" : ""}
    >
      <View className="flex-1 flex-row items-center">
        {/* Left icon */}
        <View className="w-[32px] mr-2 items-center justify-center">
          <MaterialIcons name={iconName} size={28} color={iconColor} />
        </View>

        {/* Title + status */}
        <View className="flex-1 pr-8">
          <Text numberOfLines={1} className="text-body font-medium text-black">
            {title}
          </Text>
          <Text numberOfLines={1} className="text-subtext font-medium" style={{ color: subColor }}>
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
}
