import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as mdi from "@mdi/js";

// --------------------
// Types
// --------------------
export type WidgetSize = "small" | "large";

export type TileKind =
  | "light"
  | "climate"
  | "fan"
  | "cover"
  | "lock"
  | "camera"
  | "media"
  | "generic";

// --------------------
// Dashboard Item Model
// (what user edits)
// --------------------
export type DashboardItem =
  | {
      type: "header";
      id: string;
      title: string;
      iconPath?: string;
    }
  | {
      type: "tile";
      id: string;
      title: string;
      kind: TileKind;
      entityId?: string;
      size: WidgetSize;
    };

// --------------------
// Internal Row Model (unchanged)
// --------------------
export type Variant = "small" | "large";

export type Tile = {
  id: string;
  title: string;
  kind: TileKind;
  entityId?: string;
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

// --------------------
// Helpers
// --------------------
const uid = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// --------------------
// Starter Items
// --------------------
const STARTER_ITEMS: DashboardItem[] = [
  { type: "header", id: "hdr_living", title: "Living Room", iconPath: mdi.mdiSofa },

  { type: "tile", id: "t_light_living", title: "Lights", kind: "light", entityId: "light.reece_room", size: "large" },
  { type: "tile", id: "t_climate_living", title: "AC", kind: "climate", entityId: "climate.living_room", size: "large" },

  { type: "header", id: "hdr_master", title: "Master Bedroom", iconPath: mdi.mdiBedEmpty },

  { type: "tile", id: "t_light_master", title: "Lights", kind: "light", entityId: "light.master_bedrom", size: "large" },
  { type: "tile", id: "t_climate_master", title: "AC", kind: "climate", entityId: "climate.master_bedroom", size: "large" },

  { type: "tile", id: "t_bath", title: "Bathroom Lights", kind: "light", entityId: "lights.master_bathroom", size: "large" },
  { type: "tile", id: "t_blind", title: "Primary Bedroom", kind: "cover", entityId: "blind.primary_bedroom", size: "small" },
  { type: "tile", id: "t_fan", title: "Fan", kind: "fan", entityId: "fan.master_bedroom", size: "small" },
];

// --------------------
// Packing: items → rows
// --------------------
export function buildLayoutFromItems(items: DashboardItem[]): DashboardRow[] {
  const rows: DashboardRow[] = [];
  let buffer: Extract<DashboardItem, { type: "tile" }>[] = [];

  const flush = () => {
    let i = 0;
    while (i < buffer.length) {
      const a = buffer[i];
      const b = buffer[i + 1];
      const c = buffer[i + 2];

      const toTile = (w: typeof a): Tile => ({
        id: w.id,
        title: w.title,
        kind: w.kind,
        entityId: w.entityId,
      });

      // split: large + small + small
      if (a.size === "large" && b?.size === "small" && c?.size === "small") {
        rows.push({
          id: uid("row"),
          type: "split",
          left: { ...toTile(a), variant: "large" },
          right: [
            { ...toTile(b), variant: "small" },
            { ...toTile(c), variant: "small" },
          ],
        });
        i += 3;
        continue;
      }

      // two large
      if (a.size === "large" && b?.size === "large") {
        rows.push({
          id: uid("row"),
          type: "two",
          variant: "large",
          items: [toTile(a), toTile(b)],
        });
        i += 2;
        continue;
      }

      // two small
      if (a.size === "small" && b?.size === "small") {
        rows.push({
          id: uid("row"),
          type: "two",
          variant: "small",
          items: [toTile(a), toTile(b)],
        });
        i += 2;
        continue;
      }

      // full fallback
      rows.push({
        id: uid("row"),
        type: "full",
        variant: a.size,
        item: toTile(a),
      });
      i += 1;
    }

    buffer = [];
  };

  for (const item of items) {
    if (item.type === "header") {
      flush();
      rows.push({
        id: uid("hdr"),
        type: "header",
        title: item.title,
        iconPath: item.iconPath,
      });
    } else {
      buffer.push(item);
    }
  }

  flush();
  return rows;
}

// --------------------
// Store
// --------------------
type DashboardState = {
  items: DashboardItem[];
  setItems: (next: DashboardItem[]) => void;

  addHeader: (title: string, iconPath?: string) => void;
  addTile: (tile: Omit<Extract<DashboardItem, { type: "tile" }>, "id" | "type">) => void;

  removeItem: (id: string) => void;
  updateItem: (
      id: string,
      patch: Partial<Omit<DashboardItem, "id" | "type">>
  ) => void;

  resetToStarter: () => void;
};

export const useDashboardWidgetsStore = create<DashboardState>()(
  persist(
    (set) => ({
      items: STARTER_ITEMS,

      setItems: (next) => set({ items: next }),

      addHeader: (title, iconPath) =>
        set((s) => ({
          items: [
            ...s.items,
            { type: "header", id: uid("hdr"), title, iconPath },
          ],
        })),

      addTile: (tile) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...tile, id: uid("t"), type: "tile" },
          ],
        })),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),

      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        })),

      resetToStarter: () => set({ items: STARTER_ITEMS }),
    }),
    {
      name: "dashboard-items-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
