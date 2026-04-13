// LargeClimateTile.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {View, Text, Pressable, PanResponder, LayoutChangeEvent } from "react-native";

import clsx from "clsx";
import Svg, { Path, Circle } from "react-native-svg";
import Card from "@/components/dashboard/Card";
import { MaterialIcons } from "@expo/vector-icons";

type HvacMode = "cool" | "heat" | "auto" | "off";

type Props = {
  title: string;
  mode: HvacMode;

  setTemp: number;
  currentTemp?: number;

  minTemp?: number;
  maxTemp?: number;
  step?: number;

  onChangeSetTemp: (t: number) => void;
  onChangeMode: (m: HvacMode) => void;
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

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
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
  onChangeMode,
  showBlueBorder = false,
}: Props) {
  const ACTIVE = modeColor(mode);
  const OFF = "#7A7A7A";
  const TRACK = "#DDDDDD";

  const isOn = mode !== "off";
  const fgColor = modeColor(mode);
  const knobColor = modeColor(mode);

  const [boxW, setBoxW] = useState(0);
  const geomRef = useRef({ cx: 0, cy: 0, r: 0 });

  const [draftTemp, setDraftTemp] = useState(setTemp);
  const draftRef = useRef(setTemp);

  // dropdown state
  const [modeOpen, setModeOpen] = useState(false);
  const [modeAnchor, setModeAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // block dial drag when user is interacting with the mode button/dropdown
  const blockDialDragRef = useRef(false);

  useEffect(() => {
    setDraftTemp(setTemp);
    draftRef.current = setTemp;
  }, [setTemp]);

  const onLayout = (e: LayoutChangeEvent) =>
    setBoxW(e.nativeEvent.layout.width);

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
    const cur = typeof currentTemp === "number" ? ` • ${currentTemp.toFixed(1)}°` : "";
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
      onStartShouldSetPanResponder: () => mode!=="off" && !blockDialDragRef.current,
      onMoveShouldSetPanResponder: () => mode!=="off" && !blockDialDragRef.current,

      onPanResponderGrant: (evt) => {
        if (blockDialDragRef.current) return;
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },

      onPanResponderMove: (evt) => {
        if (blockDialDragRef.current) return;
        updateFromTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },

      onPanResponderRelease: () => {
        if (blockDialDragRef.current) return;
        onChangeSetTemp(draftRef.current);
      },

      onPanResponderTerminate: () => {
        if (blockDialDragRef.current) return;
        onChangeSetTemp(draftRef.current);
      },
    });
  }, [minTemp, maxTemp, step, onChangeSetTemp, mode]);

  const options = useMemo(
    () =>
      [
        { key: "cool", label: "Cool", icon: "ac-unit" },
        { key: "heat", label: "Heat", icon: "whatshot" },
        { key: "auto", label: "Auto", icon: "autorenew" },
        { key: "off", label: "Off", icon: "power-settings-new" },
      ] as const,
    []
  );

  return (
    <Card
      variant="large"
      allowOverflow
      className={clsx(
          showBlueBorder && "border border-blue-500",
          modeOpen && "z-50"
      )}
    >
      <View onLayout={onLayout} className="flex-1 pt-1.5 items-center">
        {/* dial */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: dial.dialH,
             zIndex: 10,
          }}
          {...panResponder.panHandlers}
        >
          {/* tap-catcher: when dropdown is open, tap anywhere to close (and block dial drag) */}
          {modeOpen && (
            <Pressable
              onPress={() => {
                setModeOpen(false);
                blockDialDragRef.current = false;
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 20,
              }}
            />
          )}

          {/* center content */}
          <View
            style={{
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
              height: dial.dialH,
              width: dial.dialW,
              transform: [{ translateY: 10 }],
              zIndex: 30, // above svg so presses work
            }}
            pointerEvents="box-none"
          >
            <Text
              className="font-semibold text-h2"
              style={{ color: "#111", lineHeight: 38 }}
              pointerEvents="none"
            >
              {(Math.round(clampedTemp * 2) / 2).toFixed(1)}°C
            </Text>

            {/* Mode button + dropdown */}
            <View style={{ position: "relative", marginTop: 6, alignItems: "center" }}>
              <Pressable
                onLayout={(e) => setModeAnchor(e.nativeEvent.layout)}
                onPress={() => {
                  const next = !modeOpen;
                  setModeOpen(next);
                  blockDialDragRef.current = next; // block dial drag while open
                }}
                onPressIn={() => {
                  blockDialDragRef.current = true; // block immediately on touch
                }}
                onPressOut={() => {
                  // keep blocking if still open; otherwise release
                  if (!modeOpen) blockDialDragRef.current = false;
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                }}
              >
                <MaterialIcons
                  name={modeIcon(mode) as any}
                  size={18}
                  color={isOn ? ACTIVE : OFF}
                />
                <Text
                  className="font-semibold text-body ml-2"
                  style={{ color: isOn ? ACTIVE : OFF }}
                >
                  {subtitle}
                </Text>
                <MaterialIcons
                  name={modeOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={18}
                  color={isOn ? ACTIVE : OFF}
                  style={{ marginLeft: 2 }}
                />
              </Pressable>

              {modeOpen && (
                <View
                  style={{
                    position: "absolute",
                    top: modeAnchor.y + modeAnchor.h + 6,
                    left: modeAnchor.x,
                    width: 110,
                    backgroundColor: "white",
                    borderRadius: 14,
                    paddingVertical: 6,
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 6,
                    zIndex: 1000,
                  }}
                >
                  {options.map((opt) => {
                    const selected = opt.key === mode;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => {
                          setModeOpen(false);
                          blockDialDragRef.current = false;
                          onChangeMode(opt.key);
                        }}
                        onPressIn={() => {
                          blockDialDragRef.current = true;
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          opacity: selected ? 1 : 0.9,
                        }}
                      >
                        <MaterialIcons
                          name={opt.icon as any}
                          size={18}
                          color={selected ? modeColor(opt.key) : "#333"}
                        />
                        <Text
                          style={{
                            marginLeft: 10,
                            fontWeight: selected ? "700" : "600",
                            color: "#111",
                          }}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <Svg width={dial.dialW} height={dial.dialH}>
            {mode !== "off" && (
              <Path
                d={bgPath}
                stroke={TRACK}
                strokeWidth={THICKNESS}
                strokeLinecap="round"
                fill="none"
              />
            )}
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
