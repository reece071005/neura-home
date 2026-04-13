//SmallLightTile.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Card from "@/components/dashboard/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { setLight } from "@/lib/api/deviceControllers/light";
import LightModal, { type RgbColor } from "@/components/dashboard/widgets/lights/LightModal";

type Props = {
  entityId: string;
  title: string;
  isOn: boolean;
  rgbColor?: [number, number, number];
  colorTemp?: number;
  onPress: () => void;
  onMenuPress?: () => void;
  showBlueBorder?: boolean;
};

export default function SmallLightTile({
  entityId,
  title,
  isOn,
  rgbColor,
  colorTemp,
  onPress,
  onMenuPress,
  showBlueBorder = false,
}: Props) {
  const [pending, setPending] = useState(false);
  const [optimisticOn, setOptimisticOn] = useState<boolean | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const effectiveOn = optimisticOn ?? isOn;
  const statusLabel = effectiveOn ? "On" : "Off";

  const iconColor = useMemo(() => {
    if (!effectiveOn) return "#7A7A7A";
    if (rgbColor) return `rgb(${rgbColor[0]},${rgbColor[1]},${rgbColor[2]})`;
    return "#F4C400";
  }, [effectiveOn, rgbColor]);

  const statusColor = useMemo(
    () => (effectiveOn ? iconColor : "#7A7A7A"),
    [effectiveOn, iconColor]
  );

  const handleToggle = async () => {
    if (pending) return;
    if (!entityId) return;

    const nextState: "on" | "off" = effectiveOn ? "off" : "on";
    setOptimisticOn(nextState === "on");
    setPending(true);

    try {
      await setLight({ entity_id: entityId, state: nextState });
      setOptimisticOn(null);
    } catch (err) {
      console.log("setLight failed", err);
      setOptimisticOn(null);
    } finally {
      setPending(false);
    }
  };

  /* ── initial colour seed ──────────────────────────────────────────────── */
  const initialPickerColor = useMemo(() => {
    if (!rgbColor) return { h: 0.09, s: 0.3, v: 1 };
    const [ri, gi, bi] = rgbColor.map((c) => c / 255) as [number, number, number];
    const max = Math.max(ri, gi, bi);
    const min = Math.min(ri, gi, bi);
    const d = max - min;
    const vv = max;
    const ss = max === 0 ? 0 : d / max;
    let hh = 0;
    if (d !== 0) {
      if (max === ri) hh = ((gi - bi) / d + (gi < bi ? 6 : 0)) / 6;
      else if (max === gi) hh = ((bi - ri) / d + 2) / 6;
      else hh = ((ri - gi) / d + 4) / 6;
    }
    return { h: hh, s: ss, v: vv };
  }, [rgbColor]);

  /* ── colour handlers ──────────────────────────────────────────────────── */
  const sendColor = async (color: RgbColor, brightness: number) => {
    try {
      await setLight({ entity_id: entityId, state: "on", brightness, rgb_color: [color.r, color.g, color.b] });
    } catch (e) { console.log("Light colour error:", String(e)); }
  };

  const sendColorTemp = async (kelvin: number, brightness: number) => {
    try {
      await setLight({ entity_id: entityId, state: "on", brightness, color_temp_kelvin: kelvin });
    } catch (e) { console.log("Light temp error:", String(e)); }
  };

  return (
    <>
      <Card
        variant="small"
        onPress={onPress}
        className={showBlueBorder ? "border border-blue-500" : ""}
      >
        <View className="flex-1 flex-row items-center" style={{ opacity: pending ? 0.6 : 1 }}>
          <View className="w-[32px] mr-2 items-center justify-center">
            <MaterialIcons
              name="lightbulb"
              size={32}
              color={iconColor}
              style={{
                textShadowColor: "rgba(0,0,0,0.18)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 5,
              }}
            />
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
                setPickerVisible(true);
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

      <LightModal
        visible={pickerVisible}
        title={title}
        entityId={entityId}
        initialColor={initialPickerColor}
        initialBrightness={200}
        initialColorTemp={colorTemp}
        onClose={() => setPickerVisible(false)}
        onCommit={async (color, brightness) => { await sendColor(color, brightness); }}
        onCommitTemp={async (kelvin, brightness) => { await sendColorTemp(kelvin, brightness); }}
        onPreview={async (color, brightness) => { await sendColor(color, brightness); }}
        onPreviewTemp={async (kelvin, brightness) => { await sendColorTemp(kelvin, brightness); }}
        onRevert={async (color, brightness) => { await sendColor(color, brightness); }}
        onRevertTemp={async (kelvin, brightness) => { await sendColorTemp(kelvin, brightness); }}
      />
    </>
  );
}