import { useEffect } from "react";
import { getDashboardState } from "@/lib/api/userState";
import { useDashboardWidgetsStore } from "@/lib/storage/dashboardWidgetStore";
import type { DashboardStateV2 } from "@/lib/api/userState";

function parseMaybeJson(x: any) {
  if (typeof x === "string") {
    try { return JSON.parse(x); } catch { return null; }
  }
  return x;
}

export function useHydrateDashboardsFromDb() {
  const hasHydrated = useDashboardWidgetsStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return; // wait until AsyncStorage rehydrate completes

    let mounted = true;
    const startSnapshot = JSON.stringify({
      dashboards: useDashboardWidgetsStore.getState().dashboards,
      activeDashboardId: useDashboardWidgetsStore.getState().activeDashboardId,
      layoutsById: useDashboardWidgetsStore.getState().layoutsById,
    });

    (async () => {
      try {
        const row = await getDashboardState();
        const parsed = parseMaybeJson(row?.state) as DashboardStateV2 | null;

        const dash = parsed?.dashboard;
        if (!dash || dash.version !== 2) return;

        if (!mounted) return;
        const currentSnapshot = JSON.stringify({
          dashboards: useDashboardWidgetsStore.getState().dashboards,
          activeDashboardId: useDashboardWidgetsStore.getState().activeDashboardId,
          layoutsById: useDashboardWidgetsStore.getState().layoutsById,
        });
        if (currentSnapshot !== startSnapshot) return;

        useDashboardWidgetsStore.setState((s) => {
          const nextDashboards = dash.dashboards ?? s.dashboards;
          const nextLayouts = dash.layoutsById ?? s.layoutsById;
          const nextActive = dash.activeDashboardId ?? s.activeDashboardId;

          const activeExists = nextDashboards.some((d) => d.id === nextActive);
          const safeActive = activeExists ? nextActive : nextDashboards[0]?.id ?? s.activeDashboardId;

          return {
            dashboards: nextDashboards,
            layoutsById: nextLayouts,
            activeDashboardId: safeActive,
            items: nextLayouts[safeActive] ?? [],
          };
        });
      } catch (e) {
        // optional log
      }
    })();

    return () => { mounted = false; };
  }, [hasHydrated]);
}
