import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as mdi from "@mdi/js";

// Types
export type WidgetSize = "small" | "large";

export type TileKind =
  | "light"
  | "climate"
  | "fan"
  | "cover"
  | "camera"
  | "ai"
  | "sensor";

// Dashboard Item Model
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

// Internal Row Model
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

// Helpers
const uid = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const dashId = () => `dash_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const DEFAULT_DASHBOARD_ID = "dash_default";

// Packing: items → rows
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

// Store
export type DashboardMeta = {
  id: string;
  name: string;
  iconPath?: string;
};

export type DashboardState = {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  dashboards: DashboardMeta[];
  activeDashboardId: string;

  layoutsById: Record<string, DashboardItem[]>;

  items: DashboardItem[];

  setActiveDashboard: (id: string) => void;

  addDashboard: (name?: string) => void;
  renameDashboard: (id: string, name: string) => void;
  setDashboardIcon: (id: string, iconPath?: string) => void;
  removeDashboard: (id: string) => void;

  setItems: (next: DashboardItem[]) => void;

  addHeader: (title: string, iconPath?: string) => void;
  addTile: (
    tile: Omit<Extract<DashboardItem, { type: "tile" }>, "id" | "type">
  ) => void;

  removeItem: (id: string) => void;
  updateItem: (
    id: string,
    patch: Partial<Omit<DashboardItem, "id" | "type">>
  ) => void;
};

function getActiveItems(s: Pick<DashboardState, "layoutsById" | "activeDashboardId">) {
  return s.layoutsById[s.activeDashboardId] ?? [];
}

export const useDashboardWidgetsStore = create<DashboardState>()(
  persist(
    (set, get) => {
      const setActiveItems = (next: DashboardItem[]) => {
        const { activeDashboardId, layoutsById } = get();
        const nextLayouts = { ...layoutsById, [activeDashboardId]: next };
        set({ layoutsById: nextLayouts, items: next });
      };

      return {
        hasHydrated: false,
        setHasHydrated: (v) => set({ hasHydrated: v }),

        dashboards: [
          {
            id: DEFAULT_DASHBOARD_ID,
            name: "Dashboard",
            iconPath: mdi.mdiViewDashboard,
          },
        ],
        activeDashboardId: DEFAULT_DASHBOARD_ID,
        layoutsById: { [DEFAULT_DASHBOARD_ID]: [] },
        items: [],

        setActiveDashboard: (id) => {
          const s = get();
          if (!s.dashboards.some((d) => d.id === id)) return;
          set({
            activeDashboardId: id,
            items: s.layoutsById[id] ?? [],
          });
        },

        addDashboard: (name = "New dashboard") => {
          const s = get();
          if (s.dashboards.length >= 3) return;

          const id = dashId();
          const meta: DashboardMeta = { id, name, iconPath: mdi.mdiViewDashboard };

          set({
            dashboards: [...s.dashboards, meta],
            layoutsById: { ...s.layoutsById, [id]: [] },
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
            ...getActiveItems(get()),
            { type: "header", id: uid("hdr"), title, iconPath },
          ]),

        addTile: (tile) =>
          setActiveItems([
            ...getActiveItems(get()),
            { ...tile, id: uid("t"), type: "tile" },
          ]),

        removeItem: (id) =>
          setActiveItems(getActiveItems(get()).filter((x) => x.id !== id)),

        updateItem: (id, patch) =>
          setActiveItems(
            getActiveItems(get()).map((x) =>
              x.id === id ? ({ ...x, ...patch } as any) : x
            )
          ),
      };
    },
    {
      name: "dashboard-items-v3",
      storage: createJSONStorage(() => AsyncStorage),

      onRehydrateStorage: () => (state, err) => {
        if (err) return;

        if (!state) return;

        state.setHasHydrated(true);

        const active = state.activeDashboardId;
        const items = state.layoutsById?.[active] ?? [];
        useDashboardWidgetsStore.setState({ items });
      },
    }
  )
);
