import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getCurrentState } from "@/lib/api/state";

export type UiHvacMode = "cool" | "heat" | "auto" | "off";

type Maps = {
  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  lightColorMap: Record<string, [number, number, number]>;
  lightTempMap: Record<string, number>;
  climateSetTempMap: Record<string, number>;
  climateModeMap: Record<string, UiHvacMode>;
  fanPctMap: Record<string, number>;
  coverPosMap: Record<string, number>;
  presenceMap: Record<string, boolean>;
};

function normalizeHvacMode(raw: unknown): UiHvacMode | null {
  if (typeof raw !== "string") return null;
  if (raw === "heat_cool") return "auto";
  if (raw === "auto") return "auto";
  if (raw === "cool") return "cool";
  if (raw === "heat") return "heat";
  if (raw === "off") return "off";
  return null;
}

export function useDashboardState(dashboardEntityIds: string[]) {
  const [lightOnMap, setLightOnMap] = React.useState<Record<string, boolean>>({});
  const [lightValues, setLightValues] = React.useState<Record<string, number>>({});
  const [lightColorMap, setLightColorMap] = React.useState<Record<string, [number, number, number]>>({});
  const [lightTempMap, setLightTempMap] = React.useState<Record<string, number>>({});
  const [climateSetTempMap, setClimateSetTempMap] = React.useState<Record<string, number>>({});
  const [climateModeMap, setClimateModeMap] = React.useState<Record<string, UiHvacMode>>({});
  const [fanPctMap, setFanPctMap] = React.useState<Record<string, number>>({});
  const [coverPosMap, setCoverPosMap] = React.useState<Record<string, number>>({});
  const [presenceMap, setPresenceMap] = React.useState<Record<string, boolean>>({});

  const fetchAndApply = React.useCallback(async () => {
    if (dashboardEntityIds.length === 0) return;

    const wanted = new Set(dashboardEntityIds);
    const all = await getCurrentState();
    const states = all.filter((s) => wanted.has(s.entity_id));

    const next: Maps = {
      lightOnMap: {},
      lightValues: {},
      lightColorMap: {},
      lightTempMap: {},
      climateSetTempMap: {},
      climateModeMap: {},
      fanPctMap: {},
      coverPosMap: {},
      presenceMap: {},
    };

    for (const s of states) {
      const domain = s.entity_id.split(".")[0];
      const attrs = s.attributes ?? {};

      // Light
      if (domain === "light") {
        const on = s.state === "on";
        next.lightOnMap[s.entity_id] = on;

        if (!on) {
          next.lightValues[s.entity_id] = 0;
        } else if (typeof attrs.brightness === "number") {
          next.lightValues[s.entity_id] = Math.max(0, Math.min(1, attrs.brightness / 255));
        }

        if (
          on &&
          Array.isArray(attrs.rgb_color) &&
          attrs.rgb_color.length === 3 &&
          attrs.rgb_color.every((n: unknown) => typeof n === "number")
        ) {
          next.lightColorMap[s.entity_id] = attrs.rgb_color as [number, number, number];
        }

        if (on && typeof attrs.color_temp_kelvin === "number") {
          next.lightTempMap[s.entity_id] = attrs.color_temp_kelvin;
        }
      }

      // Climate
      if (domain === "climate") {
        if (typeof attrs.temperature === "number") {
          next.climateSetTempMap[s.entity_id] = attrs.temperature;
        }
        const mode =
          normalizeHvacMode(s.state) ?? normalizeHvacMode(attrs.hvac_mode) ?? null;
        if (mode) next.climateModeMap[s.entity_id] = mode;
      }

      // Fan
      if (domain === "fan") {
        next.fanPctMap[s.entity_id] =
          typeof attrs.percentage === "number"
            ? attrs.percentage
            : s.state === "on" ? 100 : 0;
      }

      // Cover
      if (domain === "cover") {
        if (typeof attrs.current_position === "number") {
          next.coverPosMap[s.entity_id] = attrs.current_position;
        }
      }

      // Sensor
      if (domain === "binary_sensor") {
        next.presenceMap[s.entity_id] = s.state === "on";
      }
    }

    // Merge with previous so missing attrs don't reset UI values
    setLightOnMap((prev) => ({ ...prev, ...next.lightOnMap }));
    setLightValues((prev) => ({ ...prev, ...next.lightValues }));
    setLightColorMap((prev) => ({ ...prev, ...next.lightColorMap }));
    setLightTempMap((prev) => ({ ...prev, ...next.lightTempMap }));
    setClimateSetTempMap((prev) => ({ ...prev, ...next.climateSetTempMap }));
    setClimateModeMap((prev) => ({ ...prev, ...next.climateModeMap }));
    setFanPctMap((prev) => ({ ...prev, ...next.fanPctMap }));
    setCoverPosMap((prev) => ({ ...prev, ...next.coverPosMap }));
    setPresenceMap((prev) => ({ ...prev, ...next.presenceMap }));
  }, [dashboardEntityIds]);

  useFocusEffect(
    React.useCallback(() => {
      if (dashboardEntityIds.length === 0) return;

      let alive = true;
      let timer: any = null;

      const loop = async () => {
        try {
          await fetchAndApply();
        } catch (e) {
          console.log("dashboard poll failed", e);
        } finally {
          if (!alive) return;
          timer = setTimeout(loop, 5000);
        }
      };

      loop();

      return () => {
        alive = false;
        if (timer) clearTimeout(timer);
      };
    }, [dashboardEntityIds, fetchAndApply])
  );

  const refreshNow = React.useCallback(async () => {
    try {
      await fetchAndApply();
    } catch (e) {
      console.log("refreshNow failed", e);
    }
  }, [fetchAndApply]);

  return {
    lightOnMap,
    lightValues,
    lightColorMap,
    lightTempMap,
    climateSetTempMap,
    climateModeMap,
    fanPctMap,
    coverPosMap,
    presenceMap,
    refreshNow,
    setLightOnMap,
    setLightValues,
    setLightColorMap,
    setClimateModeMap,
    setCoverPosMap,
  };
}