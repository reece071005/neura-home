/**
 * Dashboard layout and widget type defintions
 *
 * This file defines the structural model for how the dashboard
 * is composed and rendered.
 */

import React from "react";
import { View, Text } from "react-native";

//Base card component, widget UI goes on top.
import Card from "@/components/dashboard/Card";

//Importing widget components
import SectionHeader from "@/components/dashboard/widgets/SectionHeader";

//Light Widgets
import LargeLightTile from "@/components/dashboard/widgets/LargeLightTile";
import SmallLightTile from "@/components/dashboard/widgets/SmallLightTile";

//Climate Widgets
import LargeClimateTile from "@/components/dashboard/widgets/LargeClimateTile";

//Fan Widgets
import SmallFanTile from "@/components/dashboard/widgets/SmallFanTile";

//Cover Widgets
import SmallCoverTile from "@/components/dashboard/widgets/SmallCoverTile";

//Camera Widgets
import LargeCameraTile from "@/components/dashboard/widgets/LargeCameraTile"

import type { DashboardRow, Tile, Variant } from "@/lib/dashboard/dashboardTypes";




//Spacing between tiles in multirows
const GAP = 8;

//Fallback tile for unsupported types
export function DashboardTile({ tile, variant }: { tile: Tile; variant: Variant }) {
  return (
    <Card variant={variant}>
      <View style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Text style={{ fontSize: 22 }}>⬛️</Text>
        <Text className="text-black font-bold text-center">{tile.title}</Text>
      </View>
    </Card>
  );
}

/*
 * Tile Renderer
 * Chooses which widget component to render based on kind and size.
 */
export function RenderTile({
  tile,
  variant,

  lightOnMap,
  lightValues,
  onPressSmallLight,
  onChangeLargeLight,

  climateSetTempMap,

  fanPctMap,

  coverPosMap,
  onChangeCover, // ✅ add
}: {
  tile: Tile;
  variant: Variant;

  //Light State
  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;

  //Climate State
  climateSetTempMap: Record<string, number>;

  // Fan State
  fanPctMap: Record<string, number>;

  //Cover State
  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void; // ✅ add
}) {
  switch (tile.kind) {
    case "light": {
      const entityId = tile.entityId ?? "";
      const isOn = entityId ? lightOnMap[entityId] ?? false : false;
      const v = entityId ? lightValues[entityId] ?? 0 : 0;

      if (variant === "large") {
        return (
          <LargeLightTile
            title={tile.title}
            entityId={entityId}
            value={v}
            isOn={isOn}
            onChange={(next) => onChangeLargeLight(entityId, next)}
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
          onMenuPress={() => console.log("menu")}
          showBlueBorder={false}
        />
      );
    }

    case "climate": {
      if (variant !== "large") return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";
      const setTemp = entityId ? climateSetTempMap[entityId] ?? 23 : 23;

      return (
        <LargeClimateTile
          title={tile.title}
          mode="cool"
          setTemp={setTemp}
          onChangeSetTemp={(t) => {
            console.log("Set climate temp", entityId, t);
          }}
        />
      );
    }

    case "fan": {
      if (variant === "small") {
        const entityId = tile.entityId ?? "";
        const pct = entityId ? fanPctMap[entityId] ?? 0 : 0;

        return (
          <SmallFanTile
            title={tile.title}
            percentage={pct}
            onChangePercentage={(nextPct) => {
              console.log("Set fan %", entityId, nextPct);
            }}
            onMenuPress={() => console.log("fan menu")}
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;
    }

    case "cover": {
      if (variant === "small") {
        const entityId = tile.entityId ?? "";
        const pos = entityId ? coverPosMap[entityId] ?? 0 : 0;

        return (
          <SmallCoverTile
            title={tile.title}
            position={pos}
            onChangePosition={(nextPos) => {
              // ✅ call your handler (which should call setCover in MainDashboard)
              onChangeCover(entityId, nextPos);
            }}
            onMenuPress={() => console.log("Blinds menu")}
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;
    }

    case "camera":
      if (variant === "large") {
        const entityId = tile.entityId ?? "";

        return (
            <LargeCameraTile
            title = {tile.title}
            cameraEntity = {tile.entityId}
            >
            </LargeCameraTile>
        )
      }

    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

/*
 * Row renderer
 * Handles layout (full, two, split, header)
 */
export function RenderRow({
  row,

  lightOnMap,
  lightValues,
  onPressSmallLight,
  onChangeLargeLight,

  climateSetTempMap,

  fanPctMap,

  coverPosMap,
  onChangeCover, // ✅ add
}: {
  row: DashboardRow;

  // lights
  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  onPressSmallLight: (entityId: string) => void;
  onChangeLargeLight: (entityId: string, v01: number) => void;

  // climate
  climateSetTempMap: Record<string, number>;

  // fan/cover
  fanPctMap: Record<string, number>;
  coverPosMap: Record<string, number>;
  onChangeCover: (entityId: string, nextPos: number) => void; // ✅ add
}) {
  switch (row.type) {
    case "header":
      return <SectionHeader title={row.title} iconPath={row.iconPath} />;

    case "full":
      return (
        <RenderTile
          tile={row.item}
          variant={row.variant}
          lightOnMap={lightOnMap}
          lightValues={lightValues}
          onPressSmallLight={onPressSmallLight}
          onChangeLargeLight={onChangeLargeLight}
          climateSetTempMap={climateSetTempMap}
          fanPctMap={fanPctMap}
          coverPosMap={coverPosMap}
          onChangeCover={onChangeCover} // ✅ pass
        />
      );

    case "two":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            <RenderTile
              tile={row.items[0]}
              variant={row.variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onPressSmallLight}
              onChangeLargeLight={onChangeLargeLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover} // ✅ pass
            />
          </View>

          <View className="flex-1">
            <RenderTile
              tile={row.items[1]}
              variant={row.variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onPressSmallLight}
              onChangeLargeLight={onChangeLargeLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover} // ✅ pass
            />
          </View>
        </View>
      );

    case "split":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            <RenderTile
              tile={row.left}
              variant={row.left.variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onPressSmallLight}
              onChangeLargeLight={onChangeLargeLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover} // ✅ pass
            />
          </View>

          <View className="flex-1" style={{ gap: GAP }}>
            <RenderTile
              tile={row.right[0]}
              variant={row.right[0].variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onPressSmallLight}
              onChangeLargeLight={onChangeLargeLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover} // ✅ pass
            />
            <RenderTile
              tile={row.right[1]}
              variant={row.right[1].variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              onPressSmallLight={onPressSmallLight}
              onChangeLargeLight={onChangeLargeLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
              onChangeCover={onChangeCover} // ✅ pass
            />
          </View>
        </View>
      );
  }
}

