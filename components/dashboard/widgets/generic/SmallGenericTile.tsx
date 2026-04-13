import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "@/components/dashboard/Card";

type Props = {
  title: string;

  // optional “state”
  subtitle?: string;          // e.g. "Idle", "Unavailable", "72%"
  isActive?: boolean;         // if you know on/off-ish state

  // configurable icon (later user picks)
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];

  onPress?: () => void;
  onMenuPress?: () => void;
  showBlueBorder?: boolean;
};

export default function SmallGenericTile({
  title,
  subtitle,
  isActive,
  iconName = "devices-other",
  onPress,
  onMenuPress,
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

        {/* Menu (absolute so it never pushes text) */}
        <View className="absolute right-0 top-0 bottom-0 w-[28px] items-end justify-center">
          <Pressable onPress={onMenuPress} hitSlop={10}>
            <MaterialIcons name="more-vert" size={24} color="#111" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
