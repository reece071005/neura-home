// app/(drawer)/(tabs)/mainDashboard.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as mdi from "@mdi/js";

//Getting layout from cache
import {useDashboardStore} from "@/lib/storage/dashboardStore";

import Card from "@/components/ui/Card";

// Header
import SectionHeader from "@/components/ui/SectionHeader";

// Lights
import LargeLightTile from "@/components/ui/LargeLightTile";
import SmallLightTile from "@/components/ui/SmallLightTile";

// Climate
import LargeClimateTile from "@/components/ui/LargeClimateTile";

// Fans
import SmallFanTile from "@/components/ui/SmallFanTile";

// Covers
import SmallCoverTile from "@/components/ui/SmallCoverTile";

// --------------------------------
// Types
// --------------------------------
type Variant = "small" | "large";

type TileKind =
    | "light"
    | "climate"
    | "fan"
    | "cover"
    | "lock"
    | "camera"
    | "media"
    | "generic";

type Tile = {
  id: string;              // for layout uniqueness (headers/rows/etc.)
  title: string;
  kind: TileKind;
  entityId?: string;       // HA entity_id
  entityIds?: string[];
};

type FullRow = {
  id: string;
  type: "full";
  variant: Variant;
  item: Tile;
};

type TwoRow = {
  id: string;
  type: "two";
  variant: Variant;
  items: [Tile, Tile];
};

type SplitRow = {
  id: string;
  type: "split";
  left: Tile & { variant: "large" };
  right: [(Tile & { variant: "small" }), (Tile & { variant: "small" })];
};

type HeaderRow = {
  id: string;
  type: "header";
  title: string;
  iconPath?: string;
};

type DashboardRow = FullRow | TwoRow | SplitRow | HeaderRow;

const GAP = 8;


// --------------------------------
// Generic fallback tile
// --------------------------------
function DashboardTile({ tile, variant }: { tile: Tile; variant: Variant }) {
  return (
      <Card variant={variant}>
        <View style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Text style={{ fontSize: 22 }}>⬛️</Text>
          <Text className="text-black font-bold text-center">{tile.title}</Text>
        </View>
      </Card>
  );
}

// --------------------------------
// Tile Renderer
// (NO HOOKS INSIDE THIS FUNCTION)
// --------------------------------
function RenderTile({
                      tile,
                      variant,
                      lightValues,
                      setLightValue,
                      climateTemps,
                      setClimateTemp,
}: {
  tile: Tile;
  variant: Variant;
  lightValues: Record<string, number>;
  setLightValue: (entityId: string | undefined, v: number) => void;
  climateTemps: Record<string, number>;
  setClimateTemp: (entityId: string | undefined, t: number) => void;
}) {
  switch (tile.kind) {
    case "light": {
      const v = tile.entityId ? lightValues[tile.entityId] ?? 0 : 0;

      if (variant === "large") {
        return (
            <LargeLightTile
                title={tile.title}
                entityId={tile.entityId ?? ""}
                value={v}
                onChange={(next) => setLightValue(tile.entityId, next)}
                onMenuPress={() => console.log("menu")}
                showBlueBorder
            />
        );
      }

      return (
          <SmallLightTile
              title={tile.title}
              onPress={() => console.log("toggle light")}
              onMenuPress={() => console.log("menu")}
              showBlueBorder={false}
          />
      );
    }

    case "climate": {
      if (variant !== "large") return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId;
      const setTemp = entityId ? climateTemps[entityId] ?? 23 : 23;

      return (
          <LargeClimateTile
              title={tile.title}
              mode="cool"
              setTemp={setTemp}
              onChangeSetTemp={(t) => setClimateTemp(entityId, t)}
          />
      );
    }

    case "fan":
      if (variant === "small") {
        return (
            <SmallFanTile
                title={tile.title}
                percentage={33}
                onChangePercentage={(pct) => console.log("New fan %:", pct)}
                onMenuPress={() => console.log("fan menu")}
            />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    case "cover":
      if (variant === "small") {
        return (
            <SmallCoverTile
                title={tile.title}
                position={50}
                onChangePosition={(pct) => console.log("New blind position %:", pct)}
                onMenuPress={() => console.log("Blinds menu")}
            />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    case "lock":
    case "camera":
    case "media":
    case "generic":
    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

// --------------------------------
// Row Renderer (LAYOUT ONLY)
// --------------------------------
function RenderRow({
  row,
  lightValues,
  setLightValue,
  climateTemps,
  setClimateTemp,
}: {
  row: DashboardRow;
  lightValues: Record<string, number>;
  setLightValue: (entityId: string | undefined, v: number) => void;
  climateTemps: Record<string, number>;
  setClimateTemp: (entityId: string | undefined, t: number) => void;
}) {
  switch (row.type) {
    case "header":
      return <SectionHeader title={row.title} iconPath={row.iconPath} />;

    case "full":
      return (
          <RenderTile
              tile={row.item}
              variant={row.variant}
              lightValues={lightValues}
              setLightValue={setLightValue}
              climateTemps={climateTemps}
              setClimateTemp={setClimateTemp}
          />
      );

    case "two":
      return (
          <View className="flex-row" style={{ gap: GAP }}>
            <View className="flex-1">
              <RenderTile
                  tile={row.items[0]}
                  variant={row.variant}
                  lightValues={lightValues}
                  setLightValue={setLightValue}
                  climateTemps={climateTemps}
                  setClimateTemp={setClimateTemp}
              />
            </View>
            <View className="flex-1">
              <RenderTile
                  tile={row.items[1]}
                  variant={row.variant}
                  lightValues={lightValues}
                  setLightValue={setLightValue}
                  climateTemps={climateTemps}
                  setClimateTemp={setClimateTemp}
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
                  lightValues={lightValues}
                  setLightValue={setLightValue}
                  climateTemps={climateTemps}
                  setClimateTemp={setClimateTemp}
              />
            </View>

            <View className="flex-1" style={{ gap: GAP }}>
              <RenderTile
                  tile={row.right[0]}
                  variant={row.right[0].variant}
                  lightValues={lightValues}
                  setLightValue={setLightValue}
                  climateTemps={climateTemps}
                  setClimateTemp={setClimateTemp}
              />
            <RenderTile
                tile={row.right[1]}
                variant={row.right[1].variant}
                lightValues={lightValues}
                setLightValue={setLightValue}
                climateTemps={climateTemps}
                setClimateTemp={setClimateTemp}
            />
            </View>
          </View>
      );
  }
}

// --------------------------------
// Screen
// --------------------------------
export default function MainDashboard() {
  const layout = useDashboardStore((s) => s.layout);

  const [lightValues, setLightValues] = useState<Record<string, number>>({});

  const setLightValue = (entityId: string | undefined, v: number) => {
    if (!entityId) return;
    setLightValues((prev) => ({ ...prev, [entityId]: v }));
  };

  // per-entity climate set temps
  const [climateTemps, setClimateTemps] = useState<Record<string, number>>({});

  const setClimateTemp = (entityId: string | undefined, t: number) => {
    if (!entityId) return;
    setClimateTemps((prev) => ({ ...prev, [entityId]: t }));
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
                  lightValues={lightValues}
                  setLightValue={setLightValue}
                  climateTemps={climateTemps}
                  setClimateTemp={setClimateTemp}
              />
          ))}
        </View>
        </ScrollView>
      </SafeAreaView>
  );
}
