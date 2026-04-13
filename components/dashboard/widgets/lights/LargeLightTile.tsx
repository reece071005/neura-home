// LargeLightTile.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, PanResponder, LayoutChangeEvent } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Card from "@/components/dashboard/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { setLight } from "@/lib/api/deviceControllers/light";
import LightModal, { type RgbColor } from "@/components/dashboard/widgets/lights/LightModal";

type Props = {
  title: string;
  entityId: string;
  value: number;
  isOn: boolean;
  rgbColor?: [number, number, number];
  colorTemp?: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  onColorCommit?: (color: RgbColor, brightness: number) => void;
  onMenuPress?: () => void;
  showBlueBorder?: boolean;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/** Convert an [r,g,b] 0-255 triple to a CSS colour string */
function rgbToCss(rgb: [number, number, number]) {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

const START_ANGLE = 180;
const END_ANGLE = 359.9;
const THICKNESS = 5;
const KNOB_R = THICKNESS * 1.25;

const YELLOW = "#F4C400";
const OFF_COLOR = "#7A7A7A";

export default function LargeLightTile({
  title,
  entityId,
  value,
  isOn,
  rgbColor,
  colorTemp,
  onChange,
  onCommit,
  onColorCommit,
  onMenuPress,
  showBlueBorder = true,
}: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const effectiveOn = isOn || value > 0.02;
  const v = clamp(effectiveOn ? value : 0, 0, 1);

  // Derive the active colour
  const activeColor = effectiveOn
    ? rgbColor ? rgbToCss(rgbColor) : YELLOW
    : OFF_COLOR;

  const [boxW, setBoxW] = useState(0);
  const geomRef = useRef({ cx: 0, cy: 0, r: 0 });
  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const onLayout = (e: LayoutChangeEvent) => {
    setBoxW(e.nativeEvent.layout.width);
  };

  const dial = useMemo(() => {
    const dialW = Math.min(Math.max(boxW || 320, 240), 280);
    const pad = Math.max(THICKNESS / 2, KNOB_R) + 2;
    const cx = dialW / 2;
    const r = 56;
    const cy = r + pad;
    const dialH = cy + r + pad;
    geomRef.current = { cx, cy, r };
    return { dialW, dialH, cx, cy, r };
  }, [boxW]);

  const angle = START_ANGLE + v * (END_ANGLE - START_ANGLE);

  const bgPath = useMemo(
    () => describeArc(dial.cx, dial.cy, dial.r, START_ANGLE, END_ANGLE),
    [dial.cx, dial.cy, dial.r]
  );
  const fgPath = useMemo(
    () => describeArc(dial.cx, dial.cy, dial.r, START_ANGLE, angle),
    [dial.cx, dial.cy, dial.r, angle]
  );
  const knob = useMemo(
    () => polarToCartesian(dial.cx, dial.cy, dial.r, angle),
    [dial.cx, dial.cy, dial.r, angle]
  );

  const sendToBackend = async (nextValue: number) => {
    const b255 = Math.max(1, Math.min(255, Math.round(nextValue * 255)));
    try {
      if (nextValue <= 0.02) {
        await setLight({ entity_id: entityId, state: "off" });
      } else {
        await setLight({ entity_id: entityId, state: "on", brightness: b255 });
      }
    } catch (e) {
      console.log("Light API error:", String(e));
    }
  };

  const panResponder = useMemo(() => {
    function updateFromTouch(x: number, y: number) {
      const { cx, cy } = geomRef.current;
      let ang = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
      if (ang < 0) ang += 360;
      const a = clamp(ang, START_ANGLE, END_ANGLE);
      const next = (a - START_ANGLE) / (END_ANGLE - START_ANGLE);
      latestValueRef.current = next;
      onChange(clamp(next, 0, 1));
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      onPanResponderMove: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      onPanResponderRelease: () => {
        sendToBackend(latestValueRef.current);
        onCommit?.(latestValueRef.current);
      },
      onPanResponderTerminate: () => {
        sendToBackend(latestValueRef.current);
        onCommit?.(latestValueRef.current);
      },
    });
  }, [onChange, entityId]);

  // colour helpers
  const sendColor = async (color: RgbColor, brightness: number) => {
    try {
      await setLight({
        entity_id: entityId,
        state: "on",
        brightness,
        rgb_color: [color.r, color.g, color.b],
      });
    } catch (e) {
      console.log("Light colour API error:", String(e));
    }
  };

  const handleColorCommit = async (color: RgbColor, brightness: number) => {
    await sendColor(color, brightness);
    onColorCommit?.(color, brightness);
  };

  const handleColorPreview = async (color: RgbColor, brightness: number) => {
    await sendColor(color, brightness);
  };

  const handleColorRevert = async (color: RgbColor, brightness: number) => {
    await sendColor(color, brightness);
  };

  // colour temp helpers
  const sendColorTemp = async (kelvin: number, brightness: number) => {
    try {
      await setLight({
        entity_id: entityId,
        state: "on",
        brightness,
        color_temp_kelvin: kelvin,
      });
    } catch (e) {
      console.log("Light temp API error:", String(e));
    }
  };

  const handleTempCommit = async (kelvin: number, brightness: number) => {
    await sendColorTemp(kelvin, brightness);
  };

  const handleTempPreview = async (kelvin: number, brightness: number) => {
    await sendColorTemp(kelvin, brightness);
  };

  const handleTempRevert = async (kelvin: number, brightness: number) => {
    await sendColorTemp(kelvin, brightness);
  };

  //  initial colour seed for the picker
  // Convert HA rgb_color [0-255] → HSV [0-1] for the modal's initialColor.
  // Falls back to a warm yellow if no colour data exists yet.
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

  return (
    <>
      <Card variant="large">
        <View onLayout={onLayout} className="flex-1 pt-1.5 items-center">
          <View style={{ position: "absolute", top: 1, right: 1, zIndex: 10 }}>
            <Pressable
              onPress={() => {
                setPickerVisible(true);
                onMenuPress?.();
              }}
              hitSlop={10}
            >
              <MaterialIcons name="more-vert" size={26} />
            </Pressable>
          </View>

          {/* dial */}
          <View
            style={{ alignItems: "center", justifyContent: "center", height: dial.dialH }}
            {...panResponder.panHandlers}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
                height: dial.dialH,
                width: dial.dialW,
                transform: [{ translateY: 10 }],
              }}
            >
              {/* Bulb colour tracks activeColor */}
              <MaterialIcons
                name="lightbulb"
                size={80}
                color={activeColor}
                style={{
                  textShadowColor: "rgba(0,0,0,0.18)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 6,
                }}
              />
            </View>

            <Svg width={dial.dialW} height={dial.dialH}>
              <Path
                d={bgPath}
                stroke="#dddddd"
                strokeWidth={THICKNESS}
                strokeLinecap="round"
                fill="none"
              />
              {/* Arc and knob track activeColor */}
              <Path
                d={fgPath}
                stroke={activeColor}
                strokeWidth={THICKNESS}
                strokeLinecap="round"
                fill="none"
              />
              <Circle cx={knob.x} cy={knob.y} r={KNOB_R} fill={activeColor} />
            </Svg>
          </View>

          <Text numberOfLines={1} className="text-black font-medium text-body text-center">
            {title}
          </Text>
        </View>
      </Card>

      <LightModal
        visible={pickerVisible}
        title={title}
        entityId={entityId}
        initialColor={initialPickerColor}
        initialBrightness={Math.round(v * 255)}
        initialColorTemp={colorTemp}
        onClose={() => setPickerVisible(false)}
        onCommit={handleColorCommit}
        onCommitTemp={handleTempCommit}
        onPreview={handleColorPreview}
        onPreviewTemp={handleTempPreview}
        onRevert={handleColorRevert}
        onRevertTemp={handleTempRevert}
      />
    </>
  );
}