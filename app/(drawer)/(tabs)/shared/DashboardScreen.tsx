// app/(drawer)/(tabs)/mainDashboard.tsx
import React, { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDashboardWidgetsStore, buildLayoutFromItems } from "@/lib/storage/dashboardWidgetStore";
import { setLight } from "@/lib/api/deviceControllers/light";
import { setCover } from "@/lib/api/deviceControllers/cover"; // ✅ add
import { useDashboardState } from "@/lib/hooks/useDashboardState";
import { getDashboardEntityIds } from "@/lib/dashboard/getDashboardEntityIds";

import { RenderRow } from "@/components/dashboard/DashboardRenderer";


const GAP = 8;

export default function DashboardScreen() {
  const items = useDashboardWidgetsStore((s) => s.items);
  const layout = useMemo(() => buildLayoutFromItems(items), [items]);

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
  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 64 }}
      >
        <View className="px-4 pt-6" style={{ gap: GAP }}>
          {layout.map((row) => (
            <RenderRow
              key={row.id}
              row={row}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onToggleLight}
              onChangeLargeLight={(entityId, v01) => {
               setLightValues((prev) => ({ ...prev, [entityId]: v01 }));
              }}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}

              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

