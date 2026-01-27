import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, Pressable, PanResponder, LayoutChangeEvent } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Card from "@/components/ui/Card";
import { MaterialIcons } from "@expo/vector-icons";

type HvacMode = "cool" | "heat" | "auto" | "off";

type Props = {
  title: string;
  mode: HvacMode;
  setTemp: number;                 // e.g. 23
  currentTemp?: number;            // e.g. 22.7
  minTemp?: number;                // default 16
  maxTemp?: number;                // default 30
  step?: number;                   // default 0.5
  onChangeSetTemp: (t: number) => void; // called while sliding
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

const START_ANGLE = 180;
const END_ANGLE = 359.9;
const THICKNESS = 5;
const KNOB_R = THICKNESS * 1.25;

function roundToStep(v: number, step: number) {
  const inv = 1 / step;
  return Math.round(v * inv) / inv;
}

function modeLabel(mode: HvacMode) {
  if (mode === "cool") return "Cool";
  if (mode === "heat") return "Heat";
  if (mode === "auto") return "Auto";
  return "Off";
}

function modeIcon(mode: HvacMode) {
  if (mode === "cool") return "ac-unit";
  if (mode === "heat") return "whatshot";
  if (mode === "auto") return "autorenew";
  return "power-settings-new";
}

function modeColor(mode: HvacMode) {
  if (mode === "cool") return "#4985EE";
  if (mode === "heat") return "#F97316";
  if (mode === "auto") return "#14B8A6";
  return "#7A7A7A";
}

export default function LargeClimateTile({
  title,
  mode,
  setTemp,
  currentTemp,
  minTemp = 16,
  maxTemp = 30,
  step = 0.5,
  onChangeSetTemp,
  onMenuPress,
  showBlueBorder = false,
}: Props) {
  const ACTIVE = modeColor(mode);
  const OFF = "#7A7A7A";
  const TRACK = "#DDDDDD";

  const isOn = mode !== "off";
  const fgColor = isOn ? ACTIVE : OFF;
  const knobColor = isOn ? ACTIVE : OFF;

  const [boxW, setBoxW] = useState(0);
  const geomRef = useRef({ cx: 0, cy: 0, r: 0 });

  const [draftTemp, setDraftTemp] = useState(setTemp);
  const draftRef = useRef(setTemp);

  useEffect(() => {
    setDraftTemp(setTemp);
    draftRef.current = setTemp;
  }, [setTemp]);

  const onLayout = (e: LayoutChangeEvent) => setBoxW(e.nativeEvent.layout.width);

  const dial = useMemo(() => {
    const dialW = Math.min(Math.max(boxW || 320, 240), 280);

    const pad = Math.max(THICKNESS / 2, KNOB_R) + 2;
    const cx = dialW / 2;
    const r = 56;         // slightly larger than your light tile for AC feel
    const cy = r + pad;
    const dialH = cy + r + pad;

    geomRef.current = { cx, cy, r };
    return { dialW, dialH, cx, cy, r };
  }, [boxW]);

  // map temperature -> 0..1
  const clampedTemp = clamp(draftTemp, minTemp, maxTemp);
  const v = (clampedTemp - minTemp) / (maxTemp - minTemp);
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

  const subtitle = useMemo(() => {
    const m = modeLabel(mode);
    const cur =
      typeof currentTemp === "number" ? ` • ${currentTemp.toFixed(1)}°` : "";
    return `${m}${cur}`;
  }, [mode, currentTemp]);

  const panResponder = useMemo(() => {
    function updateFromTouch(x: number, y: number) {
      const { cx, cy } = geomRef.current;

      let ang = (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
      if (ang < 0) ang += 360;

      const a = clamp(ang, START_ANGLE, END_ANGLE);
      const nextV = (a - START_ANGLE) / (END_ANGLE - START_ANGLE);

      const rawTemp = minTemp + nextV * (maxTemp - minTemp);
      const stepped = roundToStep(rawTemp, step);
      const nextTemp = clamp(stepped, minTemp, maxTemp);

      draftRef.current = nextTemp;
      setDraftTemp(nextTemp);
    }

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),

      onPanResponderMove: (evt) =>
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY),

      onPanResponderRelease: () => {
        onChangeSetTemp(draftRef.current); // ✅ commit once
    },
      onPanResponderTerminate: () => {
        onChangeSetTemp(draftRef.current);
    },
    });
  }, [minTemp, maxTemp, step, onChangeSetTemp]);

  return (
    <Card
      variant="large"
      className={[showBlueBorder ? "border border-blue-500" : ""].join(" ")}
    >
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
          {/* center content (Option B) */}
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
            <Text className="font-semibold text-h2"
              style={{
                color: "#111",
                lineHeight: 38,
              }}
            >
              {(Math.round(clampedTemp * 2) / 2).toFixed(1)}°C
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <MaterialIcons
                name={modeIcon(mode) as any}
                size={18}
                color={isOn ? ACTIVE : OFF}
              />
              <Text className="font-semibold text-body ml-2"
                style={{
                  color: isOn ? ACTIVE : OFF,
                }}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          <Svg width={dial.dialW} height={dial.dialH}>
            <Path d={bgPath} stroke={TRACK} strokeWidth={THICKNESS} strokeLinecap="round" fill="none" />
            <Path d={fgPath} stroke={fgColor} strokeWidth={THICKNESS} strokeLinecap="round" fill="none" />
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
