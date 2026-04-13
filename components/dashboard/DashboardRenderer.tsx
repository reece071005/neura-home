// DashboardRenderer.tsx
import React from "react";
import { View, Text } from "react-native";

import Card from "@/components/dashboard/Card";
import SectionHeader from "@/components/dashboard/widgets/header/SectionHeader";

import LargeLightTile from "@/components/dashboard/widgets/lights/LargeLightTile";
import SmallLightTile from "@/components/dashboard/widgets/lights/SmallLightTile";

import LargeClimateTile from "@/components/dashboard/widgets/climate/LargeClimateTile";

import SmallFanTile from "@/components/dashboard/widgets/fan/SmallFanTile";

import SmallCoverTile from "@/components/dashboard/widgets/cover/SmallCoverTile";

import LargeCameraTile from "@/components/dashboard/widgets/camera/LargeCameraTile";

import SmallPresenceTile from "@/components/dashboard/widgets/presence/SmallPresenceTile";

import SmallAISuggestionTile from "@/components/dashboard/widgets/AI/SmallAISuggestionTile";

import type { DashboardRow, Tile, Variant } from "@/lib/dashboard/dashboardTypes";

type HvacMode = "cool" | "heat" | "auto" | "off";

const GAP = 8;

//  Fallback Tile
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

// Tile
export function RenderTile({
  tile,
  variant,

  lightOnMap,
  lightValues,
  lightColorMap,
  lightTempMap,
  onPressSmallLight,
  onChangeLargeLight,
  onCommitLargeLight,

  climateSetTempMap,
  climateModeMap,
  onChangeClimateMode,
  onCommitClimateTemp,

  fanPctMap,
  onChangeFanPct,

  coverPosMap,
  onChangeCover,

  presenceMap,

  aiSuggestions,
  room,
}: {
  tile: Tile;
  variant: Variant;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  lightColorMap: Record<string, [number, number, number]>;
  lightTempMap: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;
  onCommitLargeLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;
  climateModeMap: Record<string, HvacMode>;
  onChangeClimateMode: (entityId: string, mode: HvacMode) => void;
  onCommitClimateTemp: (entityId: string, temp: number) => void;

  fanPctMap: Record<string, number>;
  onChangeFanPct: (entityId: string, pct: number) => void;

  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void;

  presenceMap: Record<string, boolean>;

  aiSuggestions: any[];
  room: string;
}) {
  switch (tile.kind) {
    // Light
    case "light": {
      const entityId = tile.entityId ?? "";
      const isOn = lightOnMap[entityId] ?? false;
      const v = lightValues[entityId] ?? 0;
      const rgb = lightColorMap[entityId];
      const colorTemp = lightTempMap[entityId];

      if (variant === "large") {
        return (
          <LargeLightTile
            title={tile.title}
            entityId={entityId}
            value={v}
            isOn={isOn}
            rgbColor={rgb}
            colorTemp={colorTemp}
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
          rgbColor={rgb}
          colorTemp={colorTemp}
          onPress={() => onPressSmallLight(entityId)}
        />
      );
    }

    // Climate
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
          onChangeSetTemp={(t) => onCommitClimateTemp(entityId, t)}
          onChangeMode={(m) => onChangeClimateMode(entityId, m)}
        />
      );
    }

    // Fan
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
          onChangePercentage={(nextPct) => onChangeFanPct(entityId, nextPct)}
        />
      );
    }

    // Cover
    case "cover": {
      if (variant !== "small")
        return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";
      const pos = coverPosMap[entityId] ?? 0;

      return (
        <SmallCoverTile
          title={tile.title}
          position={pos}
          onChangePosition={(nextPos) => onChangeCover(entityId, nextPos)}
        />
      );
    }

    // Camera
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

    // Sensor
    case "sensor": {
      const entityId = tile.entityId ?? "";
      const detected = presenceMap[entityId] ?? false;

      return (
        <SmallPresenceTile
          title={tile.title}
          detected={detected}
        />
      );
    }

    // AI
    case "ai": {
      if (variant !== "small")
        return <DashboardTile tile={tile} variant={variant} />;

      const suggestions = aiSuggestions ?? [];

      return (
        <SmallAISuggestionTile
          title={tile.title}
          room={room}
          suggestions={suggestions}
        />
      );
    }

    //Default
    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

// Row
export function RenderRow({
  row,

  lightOnMap,
  lightValues,
  lightColorMap,
  lightTempMap,
  onPressSmallLight,
  onChangeLargeLight,
  onCommitLargeLight,

  climateSetTempMap,
  climateModeMap,
  onChangeClimateMode,
  onCommitClimateTemp,

  fanPctMap,
  onChangeFanPct,

  coverPosMap,
  onChangeCover,

  presenceMap,

  aiSuggestions,
  room,
}: {
  row: DashboardRow;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  lightColorMap: Record<string, [number, number, number]>;
  lightTempMap: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;
  onCommitLargeLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;
  climateModeMap: Record<string, HvacMode>;
  onChangeClimateMode: (entityId: string, mode: HvacMode) => void;
  onCommitClimateTemp: (entityId: string, temp: number) => void;

  fanPctMap: Record<string, number>;
  onChangeFanPct: (entityId: string, pct: number) => void;

  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void;

  presenceMap: Record<string, boolean>;

  aiSuggestions: any[];
  room: string;
}) {
  const render = (tile: Tile, variant: Variant) => (
    <RenderTile
      tile={tile}
      variant={variant}
      lightOnMap={lightOnMap}
      lightValues={lightValues}
      lightColorMap={lightColorMap}
      lightTempMap={lightTempMap}
      onPressSmallLight={onPressSmallLight}
      onChangeLargeLight={onChangeLargeLight}
      onCommitLargeLight={onCommitLargeLight}
      climateSetTempMap={climateSetTempMap}
      climateModeMap={climateModeMap}
      onChangeClimateMode={onChangeClimateMode}
      onCommitClimateTemp={onCommitClimateTemp}
      fanPctMap={fanPctMap}
      onChangeFanPct={onChangeFanPct}
      coverPosMap={coverPosMap}
      onChangeCover={onChangeCover}
      presenceMap={presenceMap}
      aiSuggestions={aiSuggestions}
      room={room}
    />
  );

  switch (row.type) {
    // Header
    case "header":
      return <SectionHeader title={row.title} iconPath={row.iconPath} />;

    // Full tile
    case "full":
      return render(row.item, row.variant);

    // Two tiles
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

    // Split tiles (single + double)
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
