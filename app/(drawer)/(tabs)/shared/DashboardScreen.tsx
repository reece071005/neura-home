// app/(drawer)/(tabs)/shared/DashboardScreen.tsx
import React, { useMemo, useState, useEffect } from "react";
import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDashboardWidgetsStore, buildLayoutFromItems } from "@/lib/storage/dashboardWidgetStore";
import { setLight } from "@/lib/api/deviceControllers/light";
import { setCover } from "@/lib/api/deviceControllers/cover";
import { useDashboardState } from "@/lib/hooks/useDashboardState";
import { getDashboardEntityIds } from "@/lib/dashboard/getDashboardEntityIds";

import { RenderRow } from "@/components/dashboard/DashboardRenderer";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

const GAP = 8;

export default function DashboardScreen() {
  //Compute Layout
  const items = useDashboardWidgetsStore((s) => s.items);
  const layout = useMemo(() => buildLayoutFromItems(items), [items]);

  //Check if layout is empty
  const isEmpty = layout.length === 0;

  // Extract entity IDs shown on dashboard
  const dashboardEntityIds = useMemo(
      () => getDashboardEntityIds(layout),
      [layout]
  );

  const {
    lightOnMap,
    lightValues,
    climateSetTempMap,
    fanPctMap,
    coverPosMap,
    refreshNow,
    setLightOnMap,
    setLightValues,
      setCoverPosMap,
  } = useDashboardState(dashboardEntityIds);

  //Fan Stuff
  const [fanPctOverrides, setFanPctOverrides] = useState<Record<string, number>>({});

  const mergedFanPctMap = useMemo(
      () => ({ ...fanPctMap, ...fanPctOverrides }),
      [fanPctMap, fanPctOverrides]
  );

  const onChangeFanPct = (entityId: string, pct: number) => {
    setFanPctOverrides((prev) => ({
      ...prev,
      [entityId]: pct,
    }));
  };

  //Light Stuff
  const [lightValueOverrides, setLightValueOverrides] = useState<Record<string, number>>({});
  const mergedLightValues = useMemo(
      () => ({ ...lightValues, ...lightValueOverrides }),
      [lightValues, lightValueOverrides]
  );
  const commitLargeLight = (entityId: string) => {
  setLightValueOverrides((prev) => {
    const next = { ...prev };
    delete next[entityId];
    return next;
  });
};

  const onToggleLight = async (entityId: string) => {
    const current = !!lightOnMap[entityId];
    const next: "on" | "off" = current ? "off" : "on";

    // optimistic
    setLightOnMap((prev) => ({ ...prev, [entityId]: next === "on" }));

    try {
      await setLight({ entity_id: entityId, state: next });
      // Immediately pull fresh state so UI doesn’t bounce until next poll
    } catch (e) {
      // revert
      setLightOnMap((prev) => ({ ...prev, [entityId]: current }));
    }
  };

  //Cover Stuff
  const onChangeCover = async (entityId: string, nextPos: number) => {
    const prev = coverPosMap[entityId] ?? 0;

    // optimistic UI
    setCoverPosMap((m) => ({ ...m, [entityId]: nextPos }));

    try {
      await setCover({ entity_id: entityId, position: nextPos });
    } catch {
      // revert on failure
      setCoverPosMap((m) => ({ ...m, [entityId]: prev }));
    }
  };

  //Climate stuff
  type HvacMode = "cool" | "heat" | "auto" | "off";
  const [climateModeMap, setClimateModeMap] = useState<Record<string, HvacMode>>({});

  const onChangeClimateMode = (entityId: string, mode: HvacMode) => {
    setClimateModeMap((prev) => ({ ...prev, [entityId]: mode }));
  };


  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 64 }}
      >
        <View className="px-4 pt-6" style={{ gap: GAP }}>
          {isEmpty? (
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
                      onChangeLargeLight={(entityId, v01) => {
                        setLightValueOverrides((prev) => ({ ...prev, [entityId]: v01 }));
                      }}
                      onCommitLargeLight={(entityId) => {
                        setLightValueOverrides((prev) => {
                          const next = {...prev};
                          delete next[entityId];
                          return next;
                        });
                      }}
                      climateSetTempMap={climateSetTempMap}
                      climateModeMap={climateModeMap}
                      onChangeClimateMode={onChangeClimateMode}

                      fanPctMap={mergedFanPctMap}

                      coverPosMap={coverPosMap}
                      onChangeCover={onChangeCover}
                      onChangeFanPct={onChangeFanPct}
                  />
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

