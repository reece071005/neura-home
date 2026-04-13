// DashboardScreen.tsx
import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { router } from "expo-router";
import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDashboardWidgetsStore, buildLayoutFromItems } from "@/lib/storage/dashboardWidgetStore";

import { setLight } from "@/lib/api/deviceControllers/light";
import { setCover } from "@/lib/api/deviceControllers/cover";
import { setClimate } from "@/lib/api/deviceControllers/climate";

import type { ClimateHvacMode } from "@/lib/api/deviceControllers/climate";

import { useDashboardState } from "@/lib/hooks/useDashboardState";
import { getDashboardEntityIds } from "@/lib/dashboard/getDashboardEntityIds";

import { getAISuggestions } from "@/lib/api/ai/aiGetSuggestions";

import { RenderRow } from "@/components/dashboard/DashboardRenderer";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import type { RgbColor } from "@/components/dashboard/widgets/lights/LightModal";

const GAP = 8;

export default function DashboardScreen() {
  const aiRoom = "Master Bedroom";
  // Layout
  const items = useDashboardWidgetsStore((s) => s.items);

  const layout = useMemo(() => buildLayoutFromItems(items), [items]);
  const isEmpty = layout.length === 0;

  const dashboardEntityIds = useMemo(() => getDashboardEntityIds(layout), [layout]);

  // Live state from backend polling
  const {
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
    setLightColorMap,
    setCoverPosMap,
  } = useDashboardState(dashboardEntityIds);

  // Pull to refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshNow?.();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNow]);

  // Fan (UI-only overrides for slider)
  const [fanPctOverrides, setFanPctOverrides] = useState<Record<string, number>>({});
  const mergedFanPctMap = useMemo(
    () => ({ ...fanPctMap, ...fanPctOverrides }),
    [fanPctMap, fanPctOverrides]
  );

  const onChangeFanPct = (entityId: string, pct: number) => {
    setFanPctOverrides((prev) => ({ ...prev, [entityId]: pct }));
  };

  // Light (UI-only overrides for large slider)
  const [lightValueOverrides, setLightValueOverrides] = useState<Record<string, number>>({});
  const pendingLightRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const mergedLightValues = useMemo(
    () => ({ ...lightValues, ...lightValueOverrides }),
    [lightValues, lightValueOverrides]
  );

  // Clear override once HA polling has caught up to our committed value
  useEffect(() => {
    setLightValueOverrides((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const entityId of Object.keys(prev)) {
        const overrideVal = prev[entityId];
        const polledVal = lightValues[entityId];

        if (polledVal !== undefined && Math.abs(polledVal - overrideVal) < 0.05) {
          delete next[entityId];

          if (pendingLightRef.current[entityId]) {
            clearTimeout(pendingLightRef.current[entityId]);
            delete pendingLightRef.current[entityId];
          }
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [lightValues]);

  const onToggleLight = async (entityId: string) => {
    const current = !!lightOnMap[entityId];
    const next: "on" | "off" = current ? "off" : "on";

    setLightOnMap((prev) => ({ ...prev, [entityId]: next === "on" }));

    try {
      await setLight({ entity_id: entityId, state: next });
      refreshNow?.();
    } catch {
      setLightOnMap((prev) => ({ ...prev, [entityId]: current }));
    }
  };

  const onChangeLargeLight = (entityId: string, v01: number) => {
    setLightValueOverrides((prev) => ({ ...prev, [entityId]: v01 }));
  };

  const onCommitLargeLight = (entityId: string) => {
    if (pendingLightRef.current[entityId]) {
      clearTimeout(pendingLightRef.current[entityId]);
    }

    pendingLightRef.current[entityId] = setTimeout(() => {
      setLightValueOverrides((prev) => {
        const next = { ...prev };
        delete next[entityId];
        return next;
      });
      delete pendingLightRef.current[entityId];
    }, 5000);
  };

  // Optimistically update lightColorMap when the picker commits a colour, tile updates immediately without waiting for the next HA poll.
  const onColorCommit = useCallback((entityId: string, color: RgbColor) => {
    setLightColorMap((prev) => ({
      ...prev,
      [entityId]: [color.r, color.g, color.b],
    }));
  }, [setLightColorMap]);

  // Cover
  const onChangeCover = async (entityId: string, nextPos: number) => {
    const prev = coverPosMap[entityId] ?? 0;

    setCoverPosMap((m) => ({ ...m, [entityId]: nextPos }));

    try {
      await setCover({ entity_id: entityId, position: nextPos });
      refreshNow?.();
    } catch {
      setCoverPosMap((m) => ({ ...m, [entityId]: prev }));
    }
  };

  // Climate
  const [climateModeOverrides, setClimateModeOverrides] = useState<
    Record<string, ClimateHvacMode>
  >({});

  const mergedClimateModeMap = useMemo(
    () => ({ ...climateModeMap, ...climateModeOverrides }),
    [climateModeMap, climateModeOverrides]
  );

  const onChangeClimateMode = async (entityId: string, mode: ClimateHvacMode) => {
    const prev = mergedClimateModeMap[entityId] ?? "cool";

    setClimateModeOverrides((m) => ({ ...m, [entityId]: mode }));

    try {
      await setClimate({
        entity_id: entityId,
        hvac_mode: mode,
        state: mode === "off" ? "off" : "on",
      });

      refreshNow?.();

      setClimateModeOverrides((m) => {
        const next = { ...m };
        delete next[entityId];
        return next;
      });
    } catch {
      setClimateModeOverrides((m) => ({ ...m, [entityId]: prev }));
    }
  };

  const onCommitClimateTemp = async (entityId: string, temp: number) => {
    const mode = mergedClimateModeMap[entityId] ?? "cool";

    try {
      await setClimate({
        entity_id: entityId,
        temperature: temp,
        hvac_mode: mode,
        state: mode === "off" ? "off" : "on",
      });

      refreshNow?.();
    } catch {}
  };

  //Load AI suggestion
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const loadAISuggestions = async () => {
      try {
        const res = await getAISuggestions(aiRoom);

        if (res.ok) {
          setAiSuggestions(res.suggestions ?? []);
        }
      } catch (err) {
        console.log("AI suggestions error", err);
      }
    };

    loadAISuggestions();

    const interval = setInterval(loadAISuggestions, 30000);

    return () => clearInterval(interval);
  }, []);

  // Render
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 64 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#F4C400"
            colors={["#F4C400"]}
          />
        }
      >
        <View className="px-4 pt-6" style={{ gap: GAP }}>
          {isEmpty ? (
            <DashboardEmptyState
              onPressEdit={() => router.push("/(drawer)/(tabs)/dashboardEdit")}
            />
          ) : (
            layout.map((row) => (
              <RenderRow
                key={row.id}
                row={row}
                lightOnMap={lightOnMap}
                lightValues={mergedLightValues}
                lightColorMap={lightColorMap}
                lightTempMap={lightTempMap}
                onPressSmallLight={onToggleLight}
                onChangeLargeLight={onChangeLargeLight}
                onCommitLargeLight={onCommitLargeLight}
                climateSetTempMap={climateSetTempMap}
                climateModeMap={mergedClimateModeMap}
                onChangeClimateMode={onChangeClimateMode}
                onCommitClimateTemp={onCommitClimateTemp}
                fanPctMap={mergedFanPctMap}
                onChangeFanPct={onChangeFanPct}
                coverPosMap={coverPosMap}
                onChangeCover={onChangeCover}
                presenceMap={presenceMap}
                aiSuggestions={aiSuggestions}
                room={aiRoom}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
