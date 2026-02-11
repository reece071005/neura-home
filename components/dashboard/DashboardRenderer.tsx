/**
 * Dashboard layout and widget type definitions
 */

import React from "react";
import { View, Text } from "react-native";

import Card from "@/components/dashboard/Card";
import SectionHeader from "@/components/dashboard/widgets/SectionHeader";

import LargeLightTile from "@/components/dashboard/widgets/LargeLightTile";
import SmallLightTile from "@/components/dashboard/widgets/SmallLightTile";

import LargeClimateTile from "@/components/dashboard/widgets/LargeClimateTile";

import SmallFanTile from "@/components/dashboard/widgets/SmallFanTile";
import SmallCoverTile from "@/components/dashboard/widgets/SmallCoverTile";
import LargeCameraTile from "@/components/dashboard/widgets/LargeCameraTile";

import type { DashboardRow, Tile, Variant } from "@/lib/dashboard/dashboardTypes";

type HvacMode = "cool" | "heat" | "auto" | "off";

const GAP = 8;

/* ----------------------------- Fallback Tile ----------------------------- */

export function DashboardTile({
  tile,
  variant,
}: {
  tile: Tile;
  variant: Variant;
}) {
  return (
    <Card variant={variant}>
      <View style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Text style={{ fontSize: 22 }}>⬛️</Text>
        <Text className="text-black font-bold text-center">{tile.title}</Text>
      </View>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Tile                                     */
/* -------------------------------------------------------------------------- */

export function RenderTile({
  tile,
  variant,

  lightOnMap,
  lightValues,
  onPressSmallLight,
  onChangeLargeLight,
  onCommitLargeLight,

  climateSetTempMap,
  climateModeMap,
  onChangeClimateMode,

  fanPctMap,
  onChangeFanPct,

  coverPosMap,
  onChangeCover,
}: {
  tile: Tile;
  variant: Variant;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;
  onCommitLargeLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;
  climateModeMap: Record<string, HvacMode>;
  onChangeClimateMode: (entityId: string, mode: HvacMode) => void;

  fanPctMap: Record<string, number>;
  onChangeFanPct: (entityId: string, pct: number) => void;

  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void;
}) {
  switch (tile.kind) {
    /* ------------------------------- LIGHT -------------------------------- */

    case "light": {
      const entityId = tile.entityId ?? "";
      const isOn = lightOnMap[entityId] ?? false;
      const v = lightValues[entityId] ?? 0;

      if (variant === "large") {
        return (
          <LargeLightTile
            title={tile.title}
            entityId={entityId}
            value={v}
            isOn={isOn}
            onChange={(next) => onChangeLargeLight(entityId, next)}
            onCommit={() => onCommitLargeLight(entityId)}
            onMenuPress={() => console.log("menu")}
            showBlueBorder
          />
        );
      }

      return (
        <SmallLightTile
          title={tile.title}
          entityId={entityId}
          isOn={isOn}
          onPress={() => onPressSmallLight(entityId)}
        />
      );
    }

    /* ------------------------------ CLIMATE ------------------------------- */

    case "climate": {
      if (variant !== "large")
        return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";

      const setTemp = climateSetTempMap[entityId] ?? 23;
      const mode = climateModeMap[entityId] ?? "cool";

      return (
        <LargeClimateTile
          title={tile.title}
          mode={mode}
          setTemp={setTemp}
          onChangeSetTemp={(t) =>
            console.log("Set climate temp", entityId, t)
          }
          onChangeMode={(m) => onChangeClimateMode(entityId, m)}
        />
      );
    }

    /* -------------------------------- FAN -------------------------------- */

    case "fan": {
      if (variant !== "small")
        return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";
      const pct = fanPctMap[entityId] ?? 0;

      return (
        <SmallFanTile
          title={tile.title}
          entityId={entityId}
          percentage={pct}
          onChangePercentage={(nextPct) =>
            onChangeFanPct(entityId, nextPct)
          }
        />
      );
    }

    /* ------------------------------- COVER -------------------------------- */

    case "cover": {
      if (variant !== "small")
        return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";
      const pos = coverPosMap[entityId] ?? 0;

      return (
        <SmallCoverTile
          title={tile.title}
          position={pos}
          onChangePosition={(nextPos) =>
            onChangeCover(entityId, nextPos)
          }
        />
      );
    }

    /* ------------------------------- CAMERA ------------------------------- */

    case "camera":
      if (variant === "large") {
        return (
          <LargeCameraTile
            title={tile.title}
            cameraEntity={tile.entityId}
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Row                                      */
/* -------------------------------------------------------------------------- */

export function RenderRow({
  row,

  lightOnMap,
  lightValues,
  onPressSmallLight,
  onChangeLargeLight,
  onCommitLargeLight,

  climateSetTempMap,
  climateModeMap,
  onChangeClimateMode,

  fanPctMap,
  onChangeFanPct,

  coverPosMap,
  onChangeCover,
}: {
  row: DashboardRow;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;
  onCommitLargeLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;
  climateModeMap: Record<string, HvacMode>;
  onChangeClimateMode: (entityId: string, mode: HvacMode) => void;

  fanPctMap: Record<string, number>;
  onChangeFanPct: (entityId: string, pct: number) => void;

  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void;
}) {
  const render = (tile: Tile, variant: Variant) => (
    <RenderTile
      tile={tile}
      variant={variant}
      lightOnMap={lightOnMap}
      lightValues={lightValues}
      onPressSmallLight={onPressSmallLight}
      onChangeLargeLight={onChangeLargeLight}
      onCommitLargeLight={onCommitLargeLight}
      climateSetTempMap={climateSetTempMap}
      climateModeMap={climateModeMap}
      onChangeClimateMode={onChangeClimateMode}
      fanPctMap={fanPctMap}
      onChangeFanPct={onChangeFanPct}
      coverPosMap={coverPosMap}
      onChangeCover={onChangeCover}
    />
  );

  switch (row.type) {
    case "header":
      return <SectionHeader title={row.title} iconPath={row.iconPath} />;

    case "full":
      return render(row.item, row.variant);

    case "two":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            {render(row.items[0], row.variant)}
          </View>
          <View className="flex-1">
            {render(row.items[1], row.variant)}
          </View>
        </View>
      );

    case "split":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            {render(row.left, row.left.variant)}
          </View>

          <View className="flex-1" style={{ gap: GAP }}>
            {render(row.right[0], row.right[0].variant)}
            {render(row.right[1], row.right[1].variant)}
          </View>
        </View>
      );
  }
}

