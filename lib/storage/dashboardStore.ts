import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as mdi from "@mdi/js";

// --------------------------------
// Types
// --------------------------------
export type Variant = "small" | "large";

export type TileKind =
  | "light"
  | "climate"
  | "fan"
  | "cover"
  | "lock"
  | "camera"
  | "media"
  | "generic";

export type Tile = {
  id: string;
  title: string;
  kind: TileKind;
  entityId?: string;
  entityIds?: string[];
};

export type FullRow = {
  id: string;
  type: "full";
  variant: Variant;
  item: Tile;
};

export type TwoRow = {
  id: string;
  type: "two";
  variant: Variant;
  items: [Tile, Tile];
};

export type SplitRow = {
  id: string;
  type: "split";
  left: Tile & { variant: "large" };
  right: [(Tile & { variant: "small" }), (Tile & { variant: "small" })];
};

export type HeaderRow = {
  id: string;
  type: "header";
  title: string;
  iconPath?: string;
};

export type DashboardRow = FullRow | TwoRow | SplitRow | HeaderRow;

// --------------------------------
// Starter layout (THE SOURCE OF TRUTH ON FIRST RUN)
// --------------------------------
const STARTER_LAYOUT: DashboardRow[] = [
  { id: "hdr_living", type: "header", title: "Living Room", iconPath: mdi.mdiSofa },
  {
    id: "row_primary",
    type: "two",
    variant: "large",
    items: [
      { id: "light_living", title: "Lights", kind: "light", entityId: "light.reece_room" },
      { id: "climate_living", title: "AC", kind: "climate", entityId: "climate.living_room" },
    ],
  },

  { id: "hdr_master", type: "header", title: "Master Bedroom", iconPath: mdi.mdiBedEmpty },
  {
    id: "row_primary2",
    type: "two",
    variant: "large",
    items: [
      { id: "light_master", title: "Lights", kind: "light", entityId: "light.master_bedrom" },
      { id: "climate_master", title: "AC", kind: "climate", entityId: "climate.master_bedroom" },
    ],
  },

  {
    id: "row_split",
    type: "split",
    left: {
      id: "lights_master_bathroom",
      title: "Bathroom Lights",
      kind: "light",
      entityId: "lights.master_bathroom",
      variant: "large",
    },
    right: [
      {
        id: "blind",
        title: "Primary Bedroom",
        kind: "cover",
        entityId: "blind.primary_bedroom",
        variant: "small",
      },
      {
        id: "fan",
        title: "Fan",
        kind: "fan",
        entityId: "fan.master_bedroom",
        variant: "small",
      },
    ],
  },

  {
    id: "row_secondary2",
    type: "two",
    variant: "small",
    items: [
      { id: "light_living2", title: "Living Room", kind: "light", entityId: "light.living_room" },
      { id: "fan_living2", title: "Guest Bedroom", kind: "fan", entityId: "fan.living_room" },
    ],
  },
];

// --------------------------------
// Helpers
// --------------------------------
const uid = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// --------------------------------
// Store
// --------------------------------
type DashboardState = {
  layout: DashboardRow[];
  setLayout: (rows: DashboardRow[]) => void;

  removeRow: (rowId: string) => void;
  removeTileFromRow: (rowId: string, tileId: string) => void;

  addHeader: (title: string, iconPath?: string) => void;
  addTileAsFullRow: (tile: Tile, variant: Variant) => void;

  // optional, handy for debugging / “Reset dashboard”
  resetToStarter: () => void;
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      layout: STARTER_LAYOUT,

      setLayout: (rows) => set({ layout: rows }),

      resetToStarter: () => set({ layout: STARTER_LAYOUT }),

      removeRow: (rowId) =>
        set((s) => ({ layout: s.layout.filter((r) => r.id !== rowId) })),

      removeTileFromRow: (rowId, tileId) =>
        set((s) => ({
          layout: s.layout
            .map((row) => {
              if (row.id !== rowId) return row;

              // header -> remove whole row
              if (row.type === "header") return null;

              if (row.type === "full") {
                return row.item.id === tileId ? null : row;
              }

              if (row.type === "two") {
                const remaining = row.items.filter((t) => t.id !== tileId);
                // if one removed, collapse to full row
                if (remaining.length === 1) {
                  return {
                    id: uid("row"),
                    type: "full",
                    variant: row.variant,
                    item: remaining[0]!,
                  } as const;
                }
                return row;
              }

              if (row.type === "split") {
                // if remove left -> collapse to "two small" row
                if (row.left.id === tileId) {
                  return {
                    id: uid("row"),
                    type: "two",
                    variant: "small",
                    items: [row.right[0], row.right[1]],
                  } as const;
                }
                // if remove a right small -> collapse to full row with left large
                if (row.right[0].id === tileId || row.right[1].id === tileId) {
                  return {
                    id: uid("row"),
                    type: "full",
                    variant: "large",
                    item: row.left,
                  } as const;
                }
                return row;
              }

              return row;
            })
            .filter(Boolean) as DashboardRow[],
        })),

      addHeader: (title, iconPath) =>
        set((s) => ({
          layout: [...s.layout, { id: uid("hdr"), type: "header", title, iconPath }],
        })),

      addTileAsFullRow: (tile, variant) =>
        set((s) => ({
          layout: [...s.layout, { id: uid("row"), type: "full", variant, item: tile }],
        })),
    }),
    {
      name: "dashboard-layout-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
