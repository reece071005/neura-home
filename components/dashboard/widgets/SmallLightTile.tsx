// components/ui/SmallLightTile.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Card from "@/components/dashboard/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { setLight } from "@/lib/api/deviceControllers/light";

type Props = {
  entityId: string;
  title: string;
  isOn: boolean;
  onPress: () => void;
  onMenuPress?: () => void;
  showBlueBorder?: boolean;
};

export default function SmallLightTile({
  entityId,
  title,
  isOn, onPress,
  onMenuPress,
  showBlueBorder = false,
}: Props) {
  const [pending, setPending] = useState(false);
  const [optimisticOn, setOptimisticOn] = useState<boolean | null>(null);

  const effectiveOn = optimisticOn ?? isOn;

  const statusLabel = effectiveOn ? "On" : "Off";
  const statusColor = useMemo(
    () => (effectiveOn ? "#F4C400" : "#7A7A7A"),
    [effectiveOn]
  );
  const iconColor = useMemo(
    () => (effectiveOn ? "#F4C400" : "#7A7A7A"),
    [effectiveOn]
  );

  const handleToggle = async () => {
    if (pending) return;

    if (!entityId) {
      console.log("❌ SmallLightTile missing entityId:", title);
      return;
    }

    const nextState: "on" | "off" = effectiveOn ? "off" : "on";

    // Optimistic UI
    setOptimisticOn(nextState === "on");
    setPending(true);

    try {
      await setLight({ entity_id: entityId, state: nextState });
      setOptimisticOn(null); // polling will keep it in sync
    } catch (err) {
      console.log("❌ setLight failed", err);
      setOptimisticOn(null); // revert
    } finally {
      setPending(false);
    }
  };

  return (
    <Card
      variant="small"
      onPress={onPress}
      className={showBlueBorder ? "border border-blue-500" : ""}
    >
      <View className="flex-1 flex-row items-center" style={{ opacity: pending ? 0.6 : 1 }}>
        <View className="w-[32px] mr-2 items-center justify-center">
          <MaterialIcons name="lightbulb" size={32} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text numberOfLines={1} className="text-body font-medium text-black">
            {title}
          </Text>
          <Text className="text-subtext font-medium" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>

        <View className="w-[28px] items-end justify-center">
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onMenuPress?.();
            }}
            hitSlop={10}
            disabled={pending}
          >
            <MaterialIcons name="more-vert" size={24} color="#111" />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}
