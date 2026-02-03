/**
 * Dashboard device state hook
 *
 * This hook is responsible for:
 * - Fetching current Home Assistant state
 * - Converting raw HA data into UI-friendly maps
 * - Keeping the dashboard in sync via polling
 */

import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getCurrentState } from "@/lib/api/state";

//Internal structure used while reducing raw state into domain maps.
type Maps = {
  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  climateSetTempMap: Record<string, number>;
  fanPctMap: Record<string, number>;
  coverPosMap: Record<string, number>;
};

export function useDashboardState(dashboardEntityIds: string[]) {
  //Sate maps keyed using entity_id
  const [lightOnMap, setLightOnMap] = React.useState<Record<string, boolean>>({});
  const [lightValues, setLightValues] = React.useState<Record<string, number>>({});
  const [climateSetTempMap, setClimateSetTempMap] = React.useState<Record<string, number>>({});
  const [fanPctMap, setFanPctMap] = React.useState<Record<string, number>>({});
  const [coverPosMap, setCoverPosMap] = React.useState<Record<string, number>>({});

  //Fetches state and coverts to domain specific map.
  const fetchAndApply = React.useCallback(async () => {
    if (dashboardEntityIds.length === 0) return;

    const wanted = new Set(dashboardEntityIds);
    const all = await getCurrentState();
    const states = all.filter((s) => wanted.has(s.entity_id));

    const next: Maps = {
      lightOnMap: {},
      lightValues: {},
      climateSetTempMap: {},
      fanPctMap: {},
      coverPosMap: {},
    };

    for (const s of states) {
      const domain = s.entity_id.split(".")[0];
      const attrs = s.attributes ?? {};

      //Light state
      if (domain === "light") {
        const on = s.state === "on";
        next.lightOnMap[s.entity_id] = s.state === "on";

        if (!on) {
          next.lightValues[s.entity_id] = 0;
        } else if (typeof attrs.brightness === "number") {
          next.lightValues[s.entity_id] = Math.max(0, Math.min(1, attrs.brightness / 255));
        }
      }

      //Climate state
      if (domain === "climate") {
        if (typeof attrs.temperature === "number") {
          next.climateSetTempMap[s.entity_id] = attrs.temperature;
        }
      }

      //Fan state
      if (domain === "fan") {
        if (typeof attrs.percentage === "number") {
          next.fanPctMap[s.entity_id] = attrs.percentage;
        } else {
          next.fanPctMap[s.entity_id] = s.state === "on" ? 100 : 0;
        }
      }

      //Cover/Blind State
      if (domain === "cover") {
        if (typeof attrs.current_position === "number") {
          next.coverPosMap[s.entity_id] = attrs.current_position;
        }
      }
    }

    // Merge with previous so missing attrs don't reset UI values
    setLightOnMap((prev) => ({ ...prev, ...next.lightOnMap }));
    setLightValues((prev) => ({ ...prev, ...next.lightValues }));
    setClimateSetTempMap((prev) => ({ ...prev, ...next.climateSetTempMap }));
    setFanPctMap((prev) => ({ ...prev, ...next.fanPctMap }));
    setCoverPosMap((prev) => ({ ...prev, ...next.coverPosMap }));
  }, [dashboardEntityIds]);

  // Poll every 5s while focused
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

  // Public manual refresh (call after actions)
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
    climateSetTempMap,
    fanPctMap,
    coverPosMap,
    refreshNow,

    // Expose setters only if you want optimistic UI from the screen layer:
    setLightOnMap,
    setLightValues,
  };
}
