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
type DashboardMeta = {
  id: string;
  name: string;
  iconPath?: string;
};

type DashboardState = {
  // Registry (max 3)
  dashboards: DashboardMeta[];
  activeDashboardId: string;

  // Layouts
  layoutsById: Record<string, DashboardItem[]>;

  // Convenience: active items (so existing screens barely change)
  items: DashboardItem[];

  // ----- actions -----
  setActiveDashboard: (id: string) => void;

  // dashboard ops
  addDashboard: (name?: string) => void;     // max 3
  renameDashboard: (id: string, name: string) => void;
  setDashboardIcon: (id: string, iconPath?: string) => void;
  removeDashboard: (id: string) => void;

  // layout ops (operate on active dashboard)
  setItems: (next: DashboardItem[]) => void;

  addHeader: (title: string, iconPath?: string) => void;
  addTile: (tile: Omit<Extract<DashboardItem, { type: "tile" }>, "id" | "type">) => void;

  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<Omit<DashboardItem, "id" | "type">>) => void;
};

const dashId = () => `dash_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const DEFAULT_DASHBOARD_ID = "dash_default";

export const useDashboardWidgetsStore = create<DashboardState>()(
  persist(
    (set, get) => {
      // helper: get active items
      const activeItems = () => {
        const { layoutsById, activeDashboardId } = get();
        return layoutsById[activeDashboardId] ?? [];
      };

      // helper: write active items and keep `items` in sync
      const setActiveItems = (next: DashboardItem[]) => {
        const { activeDashboardId, layoutsById } = get();
        const nextLayouts = { ...layoutsById, [activeDashboardId]: next };
        set({ layoutsById: nextLayouts, items: next });
      };

      return {
        dashboards: [
          { id: DEFAULT_DASHBOARD_ID, name: "Dashboard", iconPath: mdi.mdiViewDashboard },
        ],
        activeDashboardId: DEFAULT_DASHBOARD_ID,

        layoutsById: {
          [DEFAULT_DASHBOARD_ID]:  [],
        },

        // keep compatibility with existing code that reads `items`
        items: [],

        setActiveDashboard: (id) => {
          const s = get();
          if (!s.dashboards.some((d) => d.id === id)) return;

          const nextItems = s.layoutsById[id] ?? [];
          set({ activeDashboardId: id, items: nextItems });
        },

        addDashboard: (name = "New dashboard") => {
          const s = get();
          if (s.dashboards.length >= 3) return;

          const id = dashId();
          const meta: DashboardMeta = { id, name, iconPath: mdi.mdiViewDashboard };

          const nextDashboards = [...s.dashboards, meta];
          const nextLayouts = { ...s.layoutsById, [id]: [] };

          set({
            dashboards: nextDashboards,
            layoutsById: nextLayouts,
            activeDashboardId: id,
            items: [],
          });
        },

        renameDashboard: (id, name) => {
          const n = name.trim() || "Dashboard";
          set((s) => ({
            dashboards: s.dashboards.map((d) => (d.id === id ? { ...d, name: n } : d)),
          }));
        },

        setDashboardIcon: (id, iconPath) => {
          set((s) => ({
            dashboards: s.dashboards.map((d) => (d.id === id ? { ...d, iconPath } : d)),
          }));
        },

        removeDashboard: (id) => {
          const s = get();
          if (s.dashboards.length <= 1) return; // keep at least one

          const pinnedID = s.dashboards[0]?.id;
          if (id === pinnedID) return;

          const nextDashboards = s.dashboards.filter((d) => d.id !== id);
          const nextLayouts = { ...s.layoutsById };
          delete nextLayouts[id];

          const nextActive =
            s.activeDashboardId === id ? nextDashboards[0].id : s.activeDashboardId;

          set({
            dashboards: nextDashboards,
            layoutsById: nextLayouts,
            activeDashboardId: nextActive,
            items: nextLayouts[nextActive] ?? [],
          });
        },

        setItems: (next) => setActiveItems(next),

        addHeader: (title, iconPath) =>
          setActiveItems([
            ...activeItems(),
            { type: "header", id: uid("hdr"), title, iconPath },
          ]),

        addTile: (tile) =>
          setActiveItems([
            ...activeItems(),
            { ...tile, id: uid("t"), type: "tile" },
          ]),

        removeItem: (id) =>
          setActiveItems(activeItems().filter((x) => x.id !== id)),

        updateItem: (id, patch) =>
          setActiveItems(
            activeItems().map((x) => (x.id === id ? ({ ...x, ...patch } as any) : x))
          ),
      };
    },
    {
      name: "dashboard-items-v3",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
