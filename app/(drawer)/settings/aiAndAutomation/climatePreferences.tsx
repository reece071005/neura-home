// climatePreferences.tsx
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Text, View, ScrollView, Switch, TextInput, Pressable, Platform, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import { getClimatePreferences, setClimatePreferences } from "@/lib/api/ai/aiClimate";

import SectionCard from "@/components/aiAndAutomation/SectionCard";
import Row from "@/components/aiAndAutomation/Row";

const EMPTY_PREFS = {
  enabled: false,
  arrival_time_weekday: "",
  arrival_time_weekend: "",
  lead_minutes: "",
  min_temp_delta: "",
  fallback_setpoint: "",
  active_confidence_threshold: "",
  min_setpoint_c: "",
  max_setpoint_c: "",
};

const SAVE_FALLBACK_PREFS = {
  arrival_time_weekday: "18:30",
  arrival_time_weekend: "13:00",
  lead_minutes: 30,
  min_temp_delta: 1,
  fallback_setpoint: 24,
  active_confidence_threshold: 0.65,
  min_setpoint_c: 18,
  max_setpoint_c: 28,
};

const TIME_STRING_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const normalizeTimeString = (time: unknown, fallback: string) => {
  if (typeof time !== "string") return fallback;
  return TIME_STRING_PATTERN.test(time) ? time : fallback;
};

const toStringIfNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? String(value) : "";

const parseNumberOrFallback = (value: string, fallback: number) => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const inputBaseStyle = {
  minWidth: 70,
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: "#F9FAFB",
  borderRadius: 8,
  borderWidth: 1,
  fontSize: 15,
  fontWeight: "500",
  color: "#111827",
  textAlign: "center",
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text
      style={{
        marginTop: 4,
        maxWidth: 220,
        fontSize: 12,
        color: "#EF4444",
        textAlign: "right",
      }}
    >
      {message}
    </Text>
  );
}

type FieldKey =
  | "arrival_time_weekday"
  | "arrival_time_weekend"
  | "lead_minutes"
  | "min_temp_delta"
  | "min_setpoint_c"
  | "max_setpoint_c"
  | "fallback_setpoint"
  | "active_confidence_threshold";

type FieldErrors = Partial<Record<FieldKey, string>>;

export default function ClimatePreferences() {
  const { room, roomId } = useLocalSearchParams<{
    room?: string;
    roomId?: string;
  }>();

  const roomIdentifier = room ?? roomId ?? "";

  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [loadedPrefs, setLoadedPrefs] = useState<typeof EMPTY_PREFS | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [showPicker, setShowPicker] = useState<null | "weekday" | "weekend">(null);
  const [iosPickerTarget, setIosPickerTarget] = useState<null | "weekday" | "weekend">(null);
  const [iosPickerValue, setIosPickerValue] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      const response = await getClimatePreferences(roomIdentifier);

      const prefsData = response?.preferences ?? {};

      const normalizedPrefs = {
        ...EMPTY_PREFS,
        enabled: Boolean(prefsData.enabled),
        arrival_time_weekday: normalizeTimeString(
          prefsData.arrival_time_weekday,
          ""
        ),
        arrival_time_weekend: normalizeTimeString(
          prefsData.arrival_time_weekend,
          ""
        ),
        lead_minutes: toStringIfNumber(prefsData.lead_minutes),
        min_temp_delta: toStringIfNumber(prefsData.min_temp_delta),
        fallback_setpoint: toStringIfNumber(prefsData.fallback_setpoint),
        active_confidence_threshold: toStringIfNumber(
          prefsData.active_confidence_threshold
        ),
        min_setpoint_c: toStringIfNumber(prefsData.min_setpoint_c),
        max_setpoint_c: toStringIfNumber(prefsData.max_setpoint_c),
      };

      setPrefs(normalizedPrefs);
      setLoadedPrefs(normalizedPrefs);
    } catch {
      setPrefs(EMPTY_PREFS);
      setLoadedPrefs(null);
    }
  }, [roomIdentifier]);

  useFocusEffect(
    useCallback(() => {
      if (!roomIdentifier) {
        setPrefs(EMPTY_PREFS);
        setLoadedPrefs(null);
        return;
      }

      load();
    }, [roomIdentifier, load])
  );

  const save = async () => {
    if (!validateBeforeSave()) return;

    const leadMinutes = parseNumberOrFallback(prefs.lead_minutes, SAVE_FALLBACK_PREFS.lead_minutes);
    const minTempDelta = parseNumberOrFallback(prefs.min_temp_delta, SAVE_FALLBACK_PREFS.min_temp_delta);
    const fallbackSetpoint = parseNumberOrFallback(prefs.fallback_setpoint, SAVE_FALLBACK_PREFS.fallback_setpoint);
    const activeConfidenceThreshold = parseNumberOrFallback(
      prefs.active_confidence_threshold,
      SAVE_FALLBACK_PREFS.active_confidence_threshold
    );
    const minSetpoint = parseNumberOrFallback(prefs.min_setpoint_c, SAVE_FALLBACK_PREFS.min_setpoint_c);
    const maxSetpoint = parseNumberOrFallback(prefs.max_setpoint_c, SAVE_FALLBACK_PREFS.max_setpoint_c);

    try {
      await setClimatePreferences({
        room: roomIdentifier,
        enabled: prefs.enabled,
        arrival_time_weekday: prefs.enabled
          ? prefs.arrival_time_weekday
          : normalizeTimeString(prefs.arrival_time_weekday, SAVE_FALLBACK_PREFS.arrival_time_weekday),
        arrival_time_weekend: prefs.enabled
          ? prefs.arrival_time_weekend
          : normalizeTimeString(prefs.arrival_time_weekend, SAVE_FALLBACK_PREFS.arrival_time_weekend),
        lead_minutes: leadMinutes,
        min_temp_delta: minTempDelta,
        fallback_setpoint: fallbackSetpoint,
        active_confidence_threshold: activeConfidenceThreshold,
        min_setpoint_c: minSetpoint,
        max_setpoint_c: maxSetpoint,
      });
    } catch {
      Alert.alert("Could not save", "Please fix highlighted fields and try again.");
      return;
    }

    // Navigate back to the room view
    if (roomId) {
      router.replace({
        pathname: "/settings/aiAndAutomation/createRoom",
        params: { id: roomId },
      });
    } else {
      router.back();
    }
  };

  const handleCancel = () => {
    setPrefs(loadedPrefs ?? EMPTY_PREFS);
    setFieldErrors({});
    setShowPicker(null);
    setIosPickerTarget(null);

    if (roomId) {
      router.replace({
        pathname: "/settings/aiAndAutomation/createRoom",
        params: { id: roomId },
      });
    } else {
      router.back();
    }
  };

  const timeStringToDate = (time: unknown, fallback: string) => {
    const validTime = normalizeTimeString(time, fallback);
    const [h, m] = validTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m);
    d.setSeconds(0);
    return d;
  };

  const dateToTimeString = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const updatePickerValue = (target: "weekday" | "weekend", date: Date) => {
    const formatted = dateToTimeString(date);
    if (target === "weekday") {
      setPrefs((p) => ({ ...p, arrival_time_weekday: formatted }));
      clearFieldError("arrival_time_weekday");
    } else {
      setPrefs((p) => ({ ...p, arrival_time_weekend: formatted }));
      clearFieldError("arrival_time_weekend");
    }
  };

  const openIosPicker = (target: "weekday" | "weekend") => {
    setIosPickerTarget(target);
    setIosPickerValue(
      target === "weekday"
        ? timeStringToDate(prefs.arrival_time_weekday, SAVE_FALLBACK_PREFS.arrival_time_weekday)
        : timeStringToDate(prefs.arrival_time_weekend, SAVE_FALLBACK_PREFS.arrival_time_weekend)
    );
  };

  const clearFieldError = (key: FieldKey) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateBeforeSave = () => {
    if (!prefs.enabled) {
      setFieldErrors({});
      return true;
    }

    const errors: FieldErrors = {};
    const leadMinutes = Number(prefs.lead_minutes);
    const minTempDelta = Number(prefs.min_temp_delta);
    const minSetpoint = Number(prefs.min_setpoint_c);
    const maxSetpoint = Number(prefs.max_setpoint_c);
    const fallbackSetpoint = Number(prefs.fallback_setpoint);
    const confidenceThreshold = Number(prefs.active_confidence_threshold);

    if (!TIME_STRING_PATTERN.test(prefs.arrival_time_weekday)) {
      errors.arrival_time_weekday = "Set a valid weekday time";
    }
    if (!TIME_STRING_PATTERN.test(prefs.arrival_time_weekend)) {
      errors.arrival_time_weekend = "Set a valid weekend time";
    }
    if (!(leadMinutes > 0)) {
      errors.lead_minutes = "Enter a value greater than 0";
    }
    if (!(minTempDelta > 0 && minTempDelta <= 10)) {
      errors.min_temp_delta = "Must be between 0 and 10";
    }
    if (!(minSetpoint >= 10 && minSetpoint <= 35)) {
      errors.min_setpoint_c = "Must be between 10 and 35";
    }
    if (!(maxSetpoint >= 10 && maxSetpoint <= 35)) {
      errors.max_setpoint_c = "Must be between 10 and 35";
    }
    if (!(fallbackSetpoint >= 16 && fallbackSetpoint <= 35)) {
      errors.fallback_setpoint = "Must be between 16 and 35";
    }
    if (
      !Number.isFinite(confidenceThreshold) ||
      confidenceThreshold <= 0 ||
      confidenceThreshold > 1
    ) {
      errors.active_confidence_threshold = "Must be between 0 and 1";
    }
    if (minSetpoint > maxSetpoint) {
      errors.min_setpoint_c = "Must be less than or equal to max";
      errors.max_setpoint_c = "Must be greater than or equal to min";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <>
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          mode="time"
          display="default"
          value={
            showPicker === "weekday"
              ? timeStringToDate(prefs.arrival_time_weekday, SAVE_FALLBACK_PREFS.arrival_time_weekday)
              : timeStringToDate(prefs.arrival_time_weekend, SAVE_FALLBACK_PREFS.arrival_time_weekend)
          }
          onChange={(event, date) => {
            const target = showPicker;
            if (!target || !date || event.type !== "set") {
              setShowPicker(null);
              return;
            }

            updatePickerValue(target, date);
            setShowPicker(null);
          }}
        />
      )}
      {Platform.OS === "ios" && iosPickerTarget && (
        <Modal
          transparent
          visible
          animationType="slide"
          onRequestClose={() => setIosPickerTarget(null)}
        >
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.2)" }}>
            <Pressable style={{ flex: 1 }} onPress={() => setIosPickerTarget(null)} />
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                paddingBottom: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E5E7EB",
                }}
              >
                <Pressable onPress={() => setIosPickerTarget(null)}>
                  <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!iosPickerTarget) return;
                    updatePickerValue(iosPickerTarget, iosPickerValue);
                    setIosPickerTarget(null);
                  }}
                >
                  <Text style={{ color: "#111827", fontWeight: "700" }}>Done</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  mode="time"
                  display="spinner"
                  style={{ alignSelf: "center" }}
                  value={iosPickerValue}
                  onChange={(_, date) => {
                    if (!date) return;
                    setIosPickerValue(date);
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Pressable onPress={handleCancel} hitSlop={12}>
            <Text style={{ fontWeight: "600", color: "#111827" }}>Cancel</Text>
          </Pressable>

          <Text
            style={{
              fontSize: 17,
              fontWeight: "700",
              color: "#111827",
            }}
          >
            {room ? `${room} Climate` : "Climate Preferences"}
          </Text>

          <Pressable onPress={save} hitSlop={12}>
            <Text style={{ fontWeight: "700", color: "#111827" }}>Save</Text>
          </Pressable>
        </View>

        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Enable */}
          <SectionCard title="Climate automation">
            <Row
              title="Enable climate preconditioning"
              isLast
              right={
                <Switch
                  value={prefs.enabled}
                  onValueChange={(v) => {
                    setPrefs((p) => ({ ...p, enabled: v }));
                    if (!v) setFieldErrors({});
                  }}
                />
              }
            />
          </SectionCard>

          {/* Arrival prediction */}
          <SectionCard title="Arrival prediction">
            <Row
              title="Weekday arrival time"
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <Pressable
                    onPress={() =>
                      Platform.OS === "ios" ? openIosPicker("weekday") : setShowPicker("weekday")
                    }
                  >
                    <Text
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: fieldErrors.arrival_time_weekday ? "#EF4444" : "#E5E7EB",
                        fontWeight: "500",
                      }}
                    >
                      {prefs.arrival_time_weekday || "Not set"}
                    </Text>
                  </Pressable>
                  <FieldError message={fieldErrors.arrival_time_weekday} />
                </View>
              }
            />

            <Row
              title="Weekend arrival time"
              isLast
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <Pressable
                    onPress={() =>
                      Platform.OS === "ios" ? openIosPicker("weekend") : setShowPicker("weekend")
                    }
                  >
                    <Text
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: fieldErrors.arrival_time_weekend ? "#EF4444" : "#E5E7EB",
                        fontWeight: "500",
                      }}
                    >
                      {prefs.arrival_time_weekend || "Not set"}
                    </Text>
                  </Pressable>
                  <FieldError message={fieldErrors.arrival_time_weekend} />
                </View>
              }
            />
          </SectionCard>

          {/* Preconditioning */}
          <SectionCard title="Preconditioning">
            <Row
              title="Start before arrival (minutes)"
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.lead_minutes}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        lead_minutes: t,
                      }))
                    }
                    onFocus={() => clearFieldError("lead_minutes")}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.lead_minutes ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.lead_minutes} />
                </View>
              }
            />

            <Row
              title="Minimum temperature change (°C)"
              isLast
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.min_temp_delta}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        min_temp_delta: t,
                      }))
                    }
                    onFocus={() => clearFieldError("min_temp_delta")}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.min_temp_delta ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.min_temp_delta} />
                </View>
              }
            />
          </SectionCard>

          {/* Temperature limits */}
          <SectionCard title="Temperature limits">
            <Row
              title="Minimum setpoint"
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.min_setpoint_c}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        min_setpoint_c: t,
                      }))
                    }
                    onFocus={() => clearFieldError("min_setpoint_c")}
                    keyboardType="numeric"
                    placeholder="18"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.min_setpoint_c ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.min_setpoint_c} />
                </View>
              }
            />

            <Row
              title="Maximum setpoint"
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.max_setpoint_c}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        max_setpoint_c: t,
                      }))
                    }
                    onFocus={() => clearFieldError("max_setpoint_c")}
                    keyboardType="numeric"
                    placeholder="28"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.max_setpoint_c ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.max_setpoint_c} />
                </View>
              }
            />

            <Row
              title="Fallback temperature"
              isLast
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.fallback_setpoint}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        fallback_setpoint: t,
                      }))
                    }
                    onFocus={() => clearFieldError("fallback_setpoint")}
                    keyboardType="numeric"
                    placeholder="24"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.fallback_setpoint ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.fallback_setpoint} />
                </View>
              }
            />
          </SectionCard>

          {/* AI sensitivity */}
          <SectionCard title="AI sensitivity">
            <Row
              title="Confidence threshold"
              isLast
              right={
                <View style={{ alignItems: "flex-end" }}>
                  <TextInput
                    value={prefs.active_confidence_threshold}
                    onChangeText={(t) =>
                      setPrefs((p) => ({
                        ...p,
                        active_confidence_threshold: t,
                      }))
                    }
                    onFocus={() => clearFieldError("active_confidence_threshold")}
                    keyboardType="numeric"
                    placeholder="0.65"
                    placeholderTextColor="#9CA3AF"
                    style={{
                      ...inputBaseStyle,
                      borderColor: fieldErrors.active_confidence_threshold ? "#EF4444" : "#E5E7EB",
                    }}
                  />
                  <FieldError message={fieldErrors.active_confidence_threshold} />
                </View>
              }
            />
          </SectionCard>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
