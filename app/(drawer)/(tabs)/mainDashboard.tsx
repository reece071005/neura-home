// app/(drawer)/(tabs)/mainDashboard.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import LargeLightTile from "@/components/ui/LargeLightTile";

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
  id: string;
  title: string;
  kind: TileKind;
  entityId?: string;
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

type DashboardRow = FullRow | TwoRow | SplitRow;

const GAP = 8;

// --------------------------------
// Layout
// --------------------------------
const LAYOUT: DashboardRow[] = [
  {
    id: "row_primary",
    type: "two",
    variant: "large",
    items: [
      {
        id: "light_primary",
        title: "Primary Bedroom",
        kind: "light",
        entityId: "light.primary_bedroom",
      },
      {
        id: "climate_primary",
        title: "AC",
        kind: "climate",
        entityId: "climate.primary_bedroom",
      },
    ],
  },

  {
    id: "row_secondary",
    type: "two",
    variant: "small",
    items: [
      {
        id: "light_living",
        title: "Living Room",
        kind: "light",
        entityId: "light.living_room",
      },
      {
        id: "fan_living",
        title: "Fan",
        kind: "fan",
        entityId: "fan.living_room",
      },
    ],
  },

  {
    id: "row_split",
    type: "split",
    left: {
      id: "blinds",
      title: "Blinds",
      kind: "cover",
      entityId: "cover.living_room",
      variant: "large",
    },
    right: [
      {
        id: "lock",
        title: "Locks",
        kind: "lock",
        entityId: "lock.front_door",
        variant: "small",
      },
      {
        id: "camera",
        title: "Camera",
        kind: "camera",
        entityId: "camera.driveway",
        variant: "small",
      },
    ],
  },
];

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
// Tile Renderer (THIS IS THE KEY)
// --------------------------------
function RenderTile({
  tile,
  variant,
  brightness,
  setBrightness,
}: {
  tile: Tile;
  variant: Variant;
  brightness: number;
  setBrightness: (v: number) => void;
}) {
  switch (tile.kind) {
    case "light":
      if (variant === "large") {
        return (
          <LargeLightTile
            title={tile.title}
            value={brightness}
            onChange={setBrightness}
            onMenuPress={() => console.log("menu")}
            showBlueBorder
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    case "climate":
    case "fan":
    case "cover":
    case "lock":
    case "camera":
    case "media":
    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

// --------------------------------
// Row Renderer (LAYOUT ONLY)
// --------------------------------
function RenderRow({
  row,
  brightness,
  setBrightness,
}: {
  row: DashboardRow;
  brightness: number;
  setBrightness: (v: number) => void;
}) {
  switch (row.type) {
    case "full":
      return (
        <RenderTile
          tile={row.item}
          variant={row.variant}
          brightness={brightness}
          setBrightness={setBrightness}
        />
      );

    case "two":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            <RenderTile
              tile={row.items[0]}
              variant={row.variant}
              brightness={brightness}
              setBrightness={setBrightness}
            />
          </View>
          <View className="flex-1">
            <RenderTile
              tile={row.items[1]}
              variant={row.variant}
              brightness={brightness}
              setBrightness={setBrightness}
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
              brightness={brightness}
              setBrightness={setBrightness}
            />
          </View>

          <View className="flex-1" style={{ gap: GAP }}>
            <RenderTile
              tile={row.right[0]}
              variant={row.right[0].variant}
              brightness={brightness}
              setBrightness={setBrightness}
            />
            <RenderTile
              tile={row.right[1]}
              variant={row.right[1].variant}
              brightness={brightness}
              setBrightness={setBrightness}
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
  const layout = useMemo(() => LAYOUT, []);
  const [brightness, setBrightness] = useState(0.6);

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
              brightness={brightness}
              setBrightness={setBrightness}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
