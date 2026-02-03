import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, PanResponder, LayoutChangeEvent } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Card from "@/components/dashboard/Card";
import { MaterialIcons } from "@expo/vector-icons";
import { setLight } from "@/lib/api/light";

type Props = {
  title: string;
  entityId: string;
  value: number;
  isOn: boolean;
  onChange: (v: number) => void;
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

// Arc sweep (clockwise)
const START_ANGLE = 180;
const END_ANGLE = 359.9;
const THICKNESS = 5;
const KNOB_R = THICKNESS * 1.25;

export default function LargeLightTile({
  title,
  entityId,
  value,
    isOn,
  onChange,
  onMenuPress,
  showBlueBorder = true,
}: Props) {

  const effectiveOn = isOn || value > 0.02;
  const v = clamp(effectiveOn ? value : 0, 0, 1);

  const ACTIVE = "#F4C400";
  const OFF = "#7A7A7A";
  const fgColor = effectiveOn ? ACTIVE : OFF;
  const iconColor = effectiveOn ? ACTIVE : OFF;
  const knobColor = effectiveOn ? ACTIVE : OFF;

  const [boxW, setBoxW] = useState(0);
  const geomRef = useRef({ cx: 0, cy: 0, r: 0 });

  // keep latest value for onRelease API call
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
    // Convert 0..1 -> 1..255 (HA brightness)
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

      onChange(clamp(next, 0, 1));
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      onPanResponderMove: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
      onPanResponderRelease: () => sendToBackend(latestValueRef.current),
      onPanResponderTerminate: () => sendToBackend(latestValueRef.current),
    });
  }, [onChange, entityId]);

  return (
    <Card variant="large">
      <View onLayout={onLayout} className="flex-1 pt-1.5 items-center">
        {/* menu */}
        <View style={{ position: "absolute", top: 1, right: 1, zIndex: 10 }}>
          <Pressable onPress={onMenuPress} hitSlop={10}>
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
            <MaterialIcons name="lightbulb" size={80} color={iconColor} />
          </View>

          <Svg width={dial.dialW} height={dial.dialH}>
            <Path
              d={bgPath}
              stroke="#dddddd"
              strokeWidth={THICKNESS}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d={fgPath}
              stroke={fgColor}
              strokeWidth={THICKNESS}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={knob.x} cy={knob.y} r={KNOB_R} fill={knobColor} />
          </Svg>
        </View>

        {/* title */}
        <Text numberOfLines={1} className="text-black font-medium text-body text-center">
          {title}
        </Text>
      </View>
    </Card>
  );
}
