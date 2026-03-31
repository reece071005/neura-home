/**
 * LightModal.tsx
 *
 * Light control bottom-sheet with two switchable panels:
 *
 *   [Colour]  — SV square + hue strip + colour presets
 *   [Temp]    — warm→cool Kelvin strip + white tone presets
 *
 * Shared across both panels:
 *   - Brightness strip
 *   - Apply / X / revert behaviour (unchanged from before)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { getDeviceState, parseLightCapabilities, type LightCapabilities } from "@/lib/api/deviceControllers/deviceState";

/* ─────────────────────────── helpers ─────────────────────────────────────── */

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

function hsvToCss(h: number, s: number, v: number) {
  const [r, g, b] = hsvToRgb(h, s, v);
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

function hsvToRgb255(h: number, s: number, v: number): RgbColor {
  const [r, g, b] = hsvToRgb(h, s, v);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Convert a colour temperature in Kelvin to an approximate RGB.
 * Range we use: 2000 K (warm/amber) → 6500 K (cool/blue-white).
 * Algorithm: Tanner Helland's approximation.
 */
function kelvinToRgb(kelvin: number): [number, number, number] {
  const t = clamp(kelvin, 1000, 40000) / 100;
  let r: number, g: number, b: number;

  // Red
  r = t <= 66 ? 255 : clamp(329.698727446 * Math.pow(t - 60, -0.1332047592), 0, 255);

  // Green
  g = t <= 66
    ? clamp(99.4708025861 * Math.log(t) - 161.1195681661, 0, 255)
    : clamp(288.1221695283 * Math.pow(t - 60, -0.0755148492), 0, 255);

  // Blue
  b = t >= 66 ? 255
    : t <= 19 ? 0
    : clamp(138.5177312231 * Math.log(t - 10) - 305.0447927307, 0, 255);

  return [Math.round(r), Math.round(g), Math.round(b)];
}

function kelvinToCss(kelvin: number) {
  const [r, g, b] = kelvinToRgb(kelvin);
  return `rgb(${r},${g},${b})`;
}

/** Map 0-1 slider position → Kelvin using a fixed 2000–6500 range.
 *  Only used for initial state before capabilities are fetched. */
const KELVIN_MIN = 2000;
const KELVIN_MAX = 6500;

/* ─────────────────────────── types ───────────────────────────────────────── */

export interface RgbColor { r: number; g: number; b: number }
export interface HsvColor { h: number; s: number; v: number }
type PanelMode = "colour" | "temp";

interface Props {
  visible: boolean;
  title: string;
  entityId: string;
  initialColor?: HsvColor;
  initialBrightness?: number;       // 0-255
  initialColorTemp?: number;        // Kelvin, e.g. 2700
  onClose: () => void;
  onCommit: (color: RgbColor, brightness: number) => void;
  onCommitTemp: (kelvin: number, brightness: number) => void;
  onPreview: (color: RgbColor, brightness: number) => void;
  onPreviewTemp: (kelvin: number, brightness: number) => void;
  onRevert: (color: RgbColor, brightness: number) => void;
  onRevertTemp: (kelvin: number, brightness: number) => void;
}

/* ─────────────────────────── layout constants ────────────────────────────── */

const SCREEN_W = Dimensions.get("window").width;
const H_PAD = 24;
const CONTENT_W = SCREEN_W - H_PAD * 2;

const PICKER_W = CONTENT_W;
const SV_H = PICKER_W;

const STRIP_H = 28;
const KNOB_R = 14;
const SV_KNOB_R = 12;

const ICON_SIZE = 16;
const ROW_GAP = 12;
const STRIP_W = CONTENT_W - ICON_SIZE - ROW_GAP;

/* ─────────────────────────── SV Square ───────────────────────────────────── */

const SvSquare = React.memo(function SvSquare({
  hue, width, height,
}: { hue: number; width: number; height: number }) {
  const pureHue = hsvToCss(hue, 1, 1);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinearGradient id="sv_sat" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="1" stopColor={pureHue} stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="sv_val" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000000" stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#sv_sat)" />
      <Rect x={0} y={0} width={width} height={height} fill="url(#sv_val)" />
    </Svg>
  );
});

/* ─────────────────────────── Hue Strip ───────────────────────────────────── */

const HUE_STOPS = 12;
const HueStrip = React.memo(function HueStrip({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinearGradient id="hue_grad" x1="0" y1="0" x2="1" y2="0">
          {Array.from({ length: HUE_STOPS + 1 }, (_, i) => (
            <Stop key={i} offset={`${(i / HUE_STOPS) * 100}%`} stopColor={hsvToCss(i / HUE_STOPS, 1, 1)} />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#hue_grad)" rx={height / 2} />
    </Svg>
  );
});

/* ─────────────────────────── Kelvin Strip ────────────────────────────────── */

// Sample a handful of Kelvin values across the range for the gradient
const KELVIN_GRAD_STOPS = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500];

const KelvinStrip = React.memo(function KelvinStrip({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgLinearGradient id="kelvin_grad" x1="0" y1="0" x2="1" y2="0">
          {KELVIN_GRAD_STOPS.map((k, i) => (
            <Stop
              key={k}
              offset={`${(i / (KELVIN_GRAD_STOPS.length - 1)) * 100}%`}
              stopColor={kelvinToCss(k)}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#kelvin_grad)" rx={height / 2} />
    </Svg>
  );
});

/* ─────────────────────────── Generic Strip Slider ────────────────────────── */

function StripSlider({
  value, width, onChange, onRelease, children,
}: {
  value: number;
  width: number;
  onChange: (v: number) => void;
  onRelease: () => void;
  children: React.ReactNode;
}) {
  const knobX = clamp(value * width, KNOB_R, width - KNOB_R);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onReleaseRef = useRef(onRelease);
  onReleaseRef.current = onRelease;

  const pan = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        onChangeRef.current(clamp(e.nativeEvent.locationX / width, 0, 1));
      },
      onPanResponderMove: (e) => {
        onChangeRef.current(clamp(e.nativeEvent.locationX / width, 0, 1));
      },
      onPanResponderRelease: () => onReleaseRef.current(),
      onPanResponderTerminate: () => onReleaseRef.current(),
    }),
    [width]
  );

  return (
    <View style={{ width, height: STRIP_H + KNOB_R, justifyContent: "center" }} {...pan.panHandlers}>
      <View style={{ width, height: STRIP_H, borderRadius: STRIP_H / 2, overflow: "hidden" }}>
        {children}
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: knobX - KNOB_R,
          top: (STRIP_H + KNOB_R) / 2 - KNOB_R,
          width: KNOB_R * 2,
          height: KNOB_R * 2,
          borderRadius: KNOB_R,
          backgroundColor: "#fff",
          borderWidth: 2.5,
          borderColor: "rgba(0,0,0,0.12)",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        }}
      />
    </View>
  );
}

/* ─────────────────────────── Mode Toggle ────────────────────────────────── */

function ModeToggle({ mode, onChange }: { mode: PanelMode; onChange: (m: PanelMode) => void }) {
  return (
    <View style={styles.toggleContainer}>
      <Pressable
        style={[styles.toggleBtn, mode === "colour" && styles.toggleBtnActive]}
        onPress={() => onChange("colour")}
      >
        <MaterialIcons
          name="palette"
          size={14}
          color={mode === "colour" ? "#111" : "#999"}
          style={{ marginRight: 5 }}
        />
        <Text style={[styles.toggleText, mode === "colour" && styles.toggleTextActive]}>
          Colour
        </Text>
      </Pressable>

      <Pressable
        style={[styles.toggleBtn, mode === "temp" && styles.toggleBtnActive]}
        onPress={() => onChange("temp")}
      >
        <MaterialIcons
          name="wb-sunny"
          size={14}
          color={mode === "temp" ? "#111" : "#999"}
          style={{ marginRight: 5 }}
        />
        <Text style={[styles.toggleText, mode === "temp" && styles.toggleTextActive]}>
          Temperature
        </Text>
      </Pressable>
    </View>
  );
}

/* ─────────────────────────── Main Component ──────────────────────────────── */

export default function LightModal({
  visible,
  title,
  entityId,
  initialColor = { h: 0.09, s: 0.3, v: 1 },
  initialBrightness = 200,
  initialColorTemp = 2700,
  onClose,
  onCommit,
  onCommitTemp,
  onPreview,
  onPreviewTemp,
  onRevert,
  onRevertTemp,
}: Props) {
  const [panelMode, setPanelMode] = useState<PanelMode>("colour");
  const [capabilities, setCapabilities] = useState<LightCapabilities>({
    hasColor: true,
    hasTemp: true,
    minKelvin: 2000,
    maxKelvin: 6500,
  });

  // Fetch capabilities once when the modal first opens
  const capFetchedRef = useRef(false);
  useEffect(() => {
    if (!visible || capFetchedRef.current) return;
    capFetchedRef.current = true;

    getDeviceState(entityId)
      .then((state) => {
        const caps = parseLightCapabilities(state);
        setCapabilities(caps);
        // Auto-select the only available panel if device doesn't support both
        if (!caps.hasColor && caps.hasTemp) setPanelMode("temp");
        if (caps.hasColor && !caps.hasTemp) setPanelMode("colour");
      })
      .catch(() => {
        // If fetch fails, leave defaults (show both panels — safe fallback)
      });
  }, [visible, entityId]);

  /* ── Colour state ───────────────────────────────────────────────────────── */
  const [hsv, setHsv] = useState<HsvColor>(initialColor);
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;

  /* ── Temp state (0-1 slider, mapped to Kelvin) ──────────────────────────── */
  const [tempSlider, setTempSlider] = useState(() =>
    clamp((initialColorTemp - 2000) / (6500 - 2000), 0, 1)
  );
  const tempSliderRef = useRef(tempSlider);
  tempSliderRef.current = tempSlider;

  /* ── Brightness (shared) ────────────────────────────────────────────────── */
  const [brightness, setBrightness] = useState(initialBrightness / 255);
  const brightnessRef = useRef(brightness);
  brightnessRef.current = brightness;

  /* ── Snapshot for revert ────────────────────────────────────────────────── */
  const snapshotRef = useRef({
    hsv: initialColor,
    tempSlider: clamp((initialColorTemp - KELVIN_MIN) / (KELVIN_MAX - KELVIN_MIN), 0, 1),
    brightness: initialBrightness / 255,
    panelMode: "colour" as PanelMode,
  });

  const initialColorRef = useRef(initialColor);
  initialColorRef.current = initialColor;
  const initialBrightnessRef = useRef(initialBrightness);
  initialBrightnessRef.current = initialBrightness;
  const initialColorTempRef = useRef(initialColorTemp);
  initialColorTempRef.current = initialColorTemp;

  useEffect(() => {
    if (visible) {
      const snap = {
        hsv: initialColorRef.current,
        tempSlider: clamp((initialColorTempRef.current - capabilities.minKelvin) / (capabilities.maxKelvin - capabilities.minKelvin), 0, 1),
        brightness: initialBrightnessRef.current / 255,
        panelMode: panelMode,
      };
      snapshotRef.current = snap;
      setHsv(snap.hsv);
      setTempSlider(snap.tempSlider);
      setBrightness(snap.brightness);
    }
  }, [visible]);

  /* ── Animation ──────────────────────────────────────────────────────────── */
  const slideY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: 600, duration: 200, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideY, backdropOpacity]);

  /* ── SV square pan ──────────────────────────────────────────────────────── */
  const firePreviewRef = useRef(() => {});

  const svPan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const s = clamp(e.nativeEvent.locationX / PICKER_W, 0, 1);
      const v = clamp(1 - e.nativeEvent.locationY / SV_H, 0, 1);
      setHsv((prev) => ({ ...prev, s, v }));
    },
    onPanResponderMove: (e) => {
      const s = clamp(e.nativeEvent.locationX / PICKER_W, 0, 1);
      const v = clamp(1 - e.nativeEvent.locationY / SV_H, 0, 1);
      setHsv((prev) => ({ ...prev, s, v }));
    },
    onPanResponderRelease: () => firePreviewRef.current(),
    onPanResponderTerminate: () => firePreviewRef.current(),
  }), []);

  /* ── Derived ────────────────────────────────────────────────────────────── */
  const kelvinMin = capabilities.minKelvin;
  const kelvinMax = capabilities.maxKelvin;
  const kelvin = Math.round(kelvinMin + tempSlider * (kelvinMax - kelvinMin));
  function sliderToKelvinDynamic(v: number) { return Math.round(kelvinMin + v * (kelvinMax - kelvinMin)); }
  function kelvinToSliderDynamic(k: number) { return (k - kelvinMin) / (kelvinMax - kelvinMin); }
  const kelvinRgb = kelvinToRgb(kelvin);

  // Preview colour shown in the apply button / footer:
  // In colour mode → HSV colour, in temp mode → Kelvin approximation
  const previewCss = panelMode === "colour"
    ? hsvToCss(hsv.h, hsv.s, hsv.v)
    : `rgb(${kelvinRgb[0]},${kelvinRgb[1]},${kelvinRgb[2]})`;

  const svKnobX = hsv.s * PICKER_W;
  const svKnobY = (1 - hsv.v) * SV_H;

  /* ── Fire preview (called on finger-up) ─────────────────────────────────── */
  const firePreview = useCallback(() => {
    if (panelMode === "colour") {
      onPreview(
        hsvToRgb255(hsvRef.current.h, hsvRef.current.s, hsvRef.current.v),
        Math.round(brightnessRef.current * 255)
      );
    } else {
      onPreviewTemp(
        sliderToKelvinDynamic(tempSliderRef.current),
        Math.round(brightnessRef.current * 255)
      );
    }
  }, [panelMode, onPreview, onPreviewTemp]);

  // Keep the ref current so svPan (created once) always fires the latest version
  firePreviewRef.current = firePreview;

  /* ── Apply ──────────────────────────────────────────────────────────────── */
  const handleApply = useCallback(() => {
    if (panelMode === "colour") {
      onCommit(hsvToRgb255(hsv.h, hsv.s, hsv.v), Math.round(brightness * 255));
    } else {
      onCommitTemp(sliderToKelvinDynamic(tempSlider), Math.round(brightness * 255));
    }
    onClose();
  }, [panelMode, hsv, tempSlider, brightness, onCommit, onCommitTemp, onClose]);

  /* ── Dismiss / revert ───────────────────────────────────────────────────── */
  const handleDismiss = useCallback(() => {
    const snap = snapshotRef.current;
    if (snap.panelMode === "colour") {
      onRevert(hsvToRgb255(snap.hsv.h, snap.hsv.s, snap.hsv.v), Math.round(snap.brightness * 255));
    } else {
      onRevertTemp(sliderToKelvinDynamic(snap.tempSlider), Math.round(snap.brightness * 255));
    }
    onClose();
  }, [onRevert, onRevertTemp, onClose]);

  /* ── Stable slider callbacks ────────────────────────────────────────────── */
  const onHueChange = useCallback((h: number) => setHsv((p) => ({ ...p, h })), []);
  const onBrightnessChange = useCallback((v: number) => setBrightness(v), []);
  const onTempChange = useCallback((v: number) => setTempSlider(v), []);

  /* ── Colour presets ─────────────────────────────────────────────────────── */
  const COLOR_PRESETS: HsvColor[] = [
    { h: 0,    s: 0,   v: 1   },
    { h: 0.08, s: 0.5, v: 1   },
    { h: 0.06, s: 1,   v: 1   },
    { h: 0,    s: 1,   v: 1   },
    { h: 0.33, s: 1,   v: 0.9 },
    { h: 0.55, s: 1,   v: 1   },
    { h: 0.66, s: 1,   v: 1   },
    { h: 0.83, s: 0.7, v: 1   },
  ];

  const handleColorPreset = useCallback((p: HsvColor) => {
    setHsv(p);
    onPreview(hsvToRgb255(p.h, p.s, p.v), Math.round(brightnessRef.current * 255));
  }, [onPreview]);

  /* ── Temp presets (Kelvin values) ───────────────────────────────────────── */
  const TEMP_PRESETS = [
    { k: 2200, label: "Candle" },
    { k: 2700, label: "Warm" },
    { k: 3000, label: "Soft" },
    { k: 4000, label: "Neutral" },
    { k: 5000, label: "Cool" },
    { k: 6500, label: "Daylight" },
  ];

  const handleTempPreset = useCallback((k: number) => {
    const slider = (k - capabilities.minKelvin) / (capabilities.maxKelvin - capabilities.minKelvin);
    setTempSlider(clamp(slider, 0, 1));
    onPreviewTemp(k, Math.round(brightnessRef.current * 255));
  }, [onPreviewTemp, capabilities.minKelvin, capabilities.maxKelvin]);

  /* ── Apply button text + border contrast ────────────────────────────────── */
  // Use relative luminance so very light colours (cool white, pale tints) always
  // get a dark label and a visible border, regardless of mode.
  const previewRgb = panelMode === "colour"
    ? hsvToRgb255(hsv.h, hsv.s, hsv.v)
    : { r: kelvinRgb[0], g: kelvinRgb[1], b: kelvinRgb[2] };

  // sRGB relative luminance (WCAG formula)
  const toLinear = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const luminance = 0.2126 * toLinear(previewRgb.r) + 0.7152 * toLinear(previewRgb.g) + 0.0722 * toLinear(previewRgb.b);
  const isLight = luminance > 0.35;

  const applyTextColor = isLight ? "#111" : "#fff";
  // Add a subtle border when the button is too close to the white sheet background
  const applyBorderStyle = isLight
    ? { borderWidth: 1.5, borderColor: "rgba(0,0,0,0.15)" }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons
            name="lightbulb"
            size={20}
            color={previewCss}
            style={{
              textShadowColor: "rgba(0,0,0,0.25)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Pressable onPress={handleDismiss} hitSlop={10}>
            <MaterialIcons name="close" size={22} color="#666" />
          </Pressable>
        </View>

        <View style={styles.body}>

          {/* ── Mode toggle — only shown if device supports both ── */}
          {capabilities.hasColor && capabilities.hasTemp && (
            <ModeToggle mode={panelMode} onChange={setPanelMode} />
          )}

          {/* ══════════════════ COLOUR PANEL ══════════════════ */}
          {panelMode === "colour" && (
            <>
              {/* SV square */}
              <View style={styles.svWrapper} {...svPan.panHandlers}>
                <SvSquare hue={hsv.h} width={PICKER_W} height={SV_H} />
                <View
                  pointerEvents="none"
                  style={[
                    styles.svKnob,
                    {
                      left: svKnobX - SV_KNOB_R,
                      top: svKnobY - SV_KNOB_R,
                      borderColor: hsv.v > 0.5 ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)",
                    },
                  ]}
                />
              </View>

              {/* Hue strip */}
              <View style={styles.sliderRow}>
                <MaterialIcons name="palette" size={ICON_SIZE} color="#bbb" />
                <StripSlider value={hsv.h} width={STRIP_W} onChange={onHueChange} onRelease={firePreview}>
                  <HueStrip width={STRIP_W} height={STRIP_H} />
                </StripSlider>
              </View>

              {/* Colour presets */}
              <View style={styles.presetsRow}>
                {COLOR_PRESETS.map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleColorPreset(p)}
                    style={[styles.swatch, { backgroundColor: hsvToCss(p.h, p.s, p.v) }]}
                  />
                ))}
              </View>
            </>
          )}

          {/* ══════════════════ TEMP PANEL ══════════════════ */}
          {panelMode === "temp" && (
            <>
              {/* Kelvin strip — taller to give more drag area */}
              <View style={styles.sliderRow}>
                <MaterialIcons name="wb-sunny" size={ICON_SIZE} color="#bbb" />
                <StripSlider value={tempSlider} width={STRIP_W} onChange={onTempChange} onRelease={firePreview}>
                  <KelvinStrip width={STRIP_W} height={STRIP_H} />
                </StripSlider>
              </View>

              {/* Kelvin label */}
              <Text style={styles.kelvinLabel}>{kelvin} K</Text>

              {/* Temp presets */}
              <View style={styles.tempPresetsRow}>
                {TEMP_PRESETS.map(({ k, label }) => (
                  <Pressable
                    key={k}
                    onPress={() => handleTempPreset(k)}
                    style={[styles.tempSwatch, { backgroundColor: kelvinToCss(k) }]}
                  >
                    <Text style={styles.tempSwatchLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* ── Brightness strip (shared) ── */}
          <View style={styles.sliderRow}>
            <MaterialIcons name="brightness-6" size={ICON_SIZE} color="#bbb" />
            <StripSlider value={brightness} width={STRIP_W} onChange={onBrightnessChange} onRelease={firePreview}>
              <Svg width={STRIP_W} height={STRIP_H} style={StyleSheet.absoluteFill}>
                <Defs>
                  <SvgLinearGradient id="br_grad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#000000" />
                    <Stop offset="1" stopColor={previewCss} />
                  </SvgLinearGradient>
                </Defs>
                <Rect x={0} y={0} width={STRIP_W} height={STRIP_H} fill="url(#br_grad)" rx={STRIP_H / 2} />
              </Svg>
            </StripSlider>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <View style={[styles.preview, { backgroundColor: previewCss }]} />
            <Text style={styles.footerLabel}>
              {panelMode === "colour"
                ? `${Math.round(brightness * 100)}% brightness`
                : `${kelvin}K · ${Math.round(brightness * 100)}%`}
            </Text>
            <Pressable
              style={[styles.applyBtn, { backgroundColor: previewCss }, applyBorderStyle]}
              onPress={handleApply}
            >
              <Text style={[styles.applyText, { color: applyTextColor }]}>Apply</Text>
            </Pressable>
          </View>

        </View>
      </Animated.View>
    </Modal>
  );
}

/* ─────────────────────────── styles ──────────────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
  handle: {
    alignSelf: "center",
    marginTop: 10,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  body: {
    paddingHorizontal: H_PAD,
    gap: 14,
  },

  /* ── Mode toggle ── */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#999",
  },
  toggleTextActive: {
    color: "#111",
    fontWeight: "600",
  },

  /* ── Colour panel ── */
  svWrapper: {
    width: PICKER_W,
    height: SV_H,
    borderRadius: 14,
    overflow: "hidden",
    alignSelf: "center",
  },
  svKnob: {
    position: "absolute",
    width: SV_KNOB_R * 2,
    height: SV_KNOB_R * 2,
    borderRadius: SV_KNOB_R,
    borderWidth: 2.5,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 6,
  },
  presetsRow: {
    width: CONTENT_W,
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
  },
  swatch: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  /* ── Temp panel ── */
  kelvinLabel: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginTop: -6,
  },
  tempPresetsRow: {
    width: CONTENT_W,
    flexDirection: "row",
    gap: 6,
    alignSelf: "center",
  },
  tempSwatch: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tempSwatchLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(0,0,0,0.55)",
  },

  /* ── Shared ── */
  sliderRow: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_GAP,
    alignSelf: "center",
  },
  footer: {
    width: CONTENT_W,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 2,
    alignSelf: "center",
  },
  preview: {
    width: 40,
    height: 40,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  footerLabel: {
    flex: 1,
    fontSize: 12,
    color: "#999",
  },
  applyBtn: {
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});