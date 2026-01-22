import React, { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, PanResponder, LayoutChangeEvent } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Card from "@/components/ui/Card";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  title: string;
  value: number;                 // 0..1
  onChange: (v: number) => void; // called while sliding
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

// Arc sweep (clockwise) – tweak later to match your design
const START_ANGLE = 180;
const END_ANGLE = 360;
const THICKNESS = 8;

export default function LargeLightTile({
  title,
  value,
  onChange,
  onMenuPress,
  showBlueBorder = true,
}: Props) {
  const [boxW, setBoxW] = useState(0);
  const geomRef = useRef({ cx: 0, cy: 0, r: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    setBoxW(e.nativeEvent.layout.width);
  };

  const dial = useMemo(() => {
    // We only need width to scale a bit. Height is fixed by Card (h-[180px]).
    const dialW = Math.min(Math.max(boxW || 320, 240), 280);


    const pad = THICKNESS / 2 + 2;
    const cx = dialW / 2;
    const r = 50;
    const cy = r + pad;

    const dialH = cy + r + pad;

    geomRef.current = { cx, cy, r };
    return { dialW, dialH, cx, cy, r };
  }, [boxW]);

  const v = clamp(value, 0, 1);
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
    });
  }, [onChange]);

  return (
    <Card
      variant="large"
    >
      <View onLayout={onLayout} style={{ flex: 1, justifyContent: "space-between", paddingTop: 5}}>
        {/* menu */}
        <View style={{ position: "absolute", top: 1, right: 1, zIndex: 10 }}>
          <Pressable onPress={onMenuPress} hitSlop={10}>
            <MaterialIcons name="more-vert" size={26} />
          </Pressable>
        </View>

        {/* dial */}
        <View
          style={{ alignItems: "center", justifyContent: "center", height: dial.dialH}}
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
        transform: [{translateY: 13}]
      }}
    >
  <MaterialIcons name="lightbulb" size={80} color="#F4C400" />
</View>
          <Svg width={dial.dialW} height={dial.dialH}>
            <Path d={bgPath} stroke="#7A7A7A" strokeWidth={THICKNESS} strokeLinecap="round" fill="none" />
            <Path d={fgPath} stroke="#F4C400" strokeWidth={THICKNESS} strokeLinecap="round" fill="none" />
            <Circle cx={knob.x} cy={knob.y} r={THICKNESS * 0.75} fill="#F4C400" />
            {/* bulb placeholder */}
          </Svg>
        </View>

        {/* title */}
        <Text
          numberOfLines={1}
          className="text-black font-medium text-body text-center"
        >
          {title}
        </Text>
      </View>
    </Card>
  );
}
