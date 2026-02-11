// app/(drawer)/(tabs)/shared/DashboardScreen.tsx
import React, { useMemo, useState } from "react";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useDashboardWidgetsStore,
  buildLayoutFromItems,
} from "@/lib/storage/dashboardWidgetStore";

import { setLight } from "@/lib/api/deviceControllers/light";
import { setCover } from "@/lib/api/deviceControllers/cover";
import { setClimate } from "@/lib/api/deviceControllers/climate";
import type { ClimateHvacMode } from "@/lib/api/deviceControllers/climate";

import { useDashboardState } from "@/lib/hooks/useDashboardState";
import { getDashboardEntityIds } from "@/lib/dashboard/getDashboardEntityIds";

import { RenderRow } from "@/components/dashboard/DashboardRenderer";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

const GAP = 8;

export default function DashboardScreen() {
  // -------------------------
  // Layout
  // -------------------------
  const items = useDashboardWidgetsStore((s) => s.items);
  const layout = useMemo(() => buildLayoutFromItems(items), [items]);
  const isEmpty = layout.length === 0;

  const dashboardEntityIds = useMemo(() => getDashboardEntityIds(layout), [layout]);

  // -------------------------
  // Live state from backend polling
  // -------------------------
  const {
    lightOnMap,
    lightValues,
    climateSetTempMap,
    climateModeMap,
    fanPctMap,
    coverPosMap,
    refreshNow,
    setLightOnMap,
    setCoverPosMap,
  } = useDashboardState(dashboardEntityIds);

  // -------------------------
  // Fan (UI-only overrides for slider)
  // -------------------------
  const [fanPctOverrides, setFanPctOverrides] = useState<Record<string, number>>({});
  const mergedFanPctMap = useMemo(
    () => ({ ...fanPctMap, ...fanPctOverrides }),
    [fanPctMap, fanPctOverrides]
  );

  const onChangeFanPct = (entityId: string, pct: number) => {
    setFanPctOverrides((prev) => ({ ...prev, [entityId]: pct }));
  };

  // -------------------------
  // Light (UI-only overrides for large slider)
  // -------------------------
  const [lightValueOverrides, setLightValueOverrides] = useState<Record<string, number>>({});
  const mergedLightValues = useMemo(
    () => ({ ...lightValues, ...lightValueOverrides }),
    [lightValues, lightValueOverrides]
  );

  const onToggleLight = async (entityId: string) => {
    const current = !!lightOnMap[entityId];
    const next: "on" | "off" = current ? "off" : "on";

    // optimistic
    setLightOnMap((prev) => ({ ...prev, [entityId]: next === "on" }));

    try {
      await setLight({ entity_id: entityId, state: next });
      refreshNow?.();
    } catch {
      // revert
      setLightOnMap((prev) => ({ ...prev, [entityId]: current }));
    }
  };

  const onChangeLargeLight = (entityId: string, v01: number) => {
    setLightValueOverrides((prev) => ({ ...prev, [entityId]: v01 }));
  };

  const onCommitLargeLight = (entityId: string) => {
    // remove override so the polled state becomes source of truth again
    setLightValueOverrides((prev) => {
      const next = { ...prev };
      delete next[entityId];
      return next;
    });
  };

  // -------------------------
  // Cover
  // -------------------------
  const onChangeCover = async (entityId: string, nextPos: number) => {
    const prev = coverPosMap[entityId] ?? 0;

    // optimistic
    setCoverPosMap((m) => ({ ...m, [entityId]: nextPos }));

    try {
      await setCover({ entity_id: entityId, position: nextPos });
      refreshNow?.();
    } catch {
      setCoverPosMap((m) => ({ ...m, [entityId]: prev }));
    }
  };

  // -------------------------
  // Climate
  // -------------------------
  const [climateModeOverrides, setClimateModeOverrides] = useState<
    Record<string, ClimateHvacMode>
  >({});

  const mergedClimateModeMap = useMemo(
    () => ({ ...climateModeMap, ...climateModeOverrides }),
    [climateModeMap, climateModeOverrides]
  );

  const onChangeClimateMode = async (entityId: string, mode: ClimateHvacMode) => {
    const prev = mergedClimateModeMap[entityId] ?? "cool";

    // optimistic
    setClimateModeOverrides((m) => ({ ...m, [entityId]: mode }));

    try {
      await setClimate({
        entity_id: entityId,
        hvac_mode: mode,
        state: mode === "off" ? "off" : "on",
      });

      refreshNow?.();

      // optional: clear override so HA polling becomes source of truth
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
        hvac_mode: mode, // keep current mode (prevents HA defaulting)
        state: mode === "off" ? "off" : "on",
      });

      refreshNow?.();
    } catch {
      // no optimistic temp map here yet; we just rely on polling
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 64 }}
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
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
