import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { useDashboardWidgetsStore, type DashboardItem } from "@/lib/storage/dashboardWidgetStore";
import { getDashboardState, setDashboardState } from "@/lib/api/userState";

type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

type DashboardMeta = { id: string; name: string; iconPath?: string };

export type DashboardStateV2 = {
  dashboard: {
    version: 2;
    dashboards: DashboardMeta[];
    activeDashboardId: string;
    layoutsById: Record<string, DashboardItem[]>;
  };
};

function isRecord(x: any): x is Record<string, any> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function looksLikeDashboardMetaArray(x: any): x is DashboardMeta[] {
  return (
    Array.isArray(x) &&
    x.every(
      (d) =>
        d &&
        typeof d === "object" &&
        typeof d.id === "string" &&
        typeof d.name === "string"
    )
  );
}

function looksLikeItems(x: any): x is DashboardItem[] {
  return (
    Array.isArray(x) &&
    x.every((it) => it && typeof it === "object" && typeof it.id === "string")
  );
}

function looksLikeLayoutsById(x: any): x is Record<string, DashboardItem[]> {
  if (!isRecord(x)) return false;
  return Object.values(x).every((v) => looksLikeItems(v));
}

function parseRowState(rowState: any): any {
  if (!rowState) return null;
  if (typeof rowState === "string") {
    try {
      return JSON.parse(rowState);
    } catch {
      return null;
    }
  }
  return rowState;
}

export function useDashboardStateSync(opts?: { debounceMs?: number }) {
  const debounceMs = opts?.debounceMs ?? 800;

  // --- pull the *full* dashboard state from store ---
  const dashboards = useDashboardWidgetsStore((s) => s.dashboards);
  const activeDashboardId = useDashboardWidgetsStore((s) => s.activeDashboardId);
  const layoutsById = useDashboardWidgetsStore((s) => s.layoutsById);

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Prevent autosave firing immediately after we hydrate from server
  const hydratingRef = useRef(false);

  // Track last saved payload so we don't POST unnecessarily
  const lastSavedRef = useRef<string>("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payload: DashboardStateV2 = useMemo(
    () => ({
      dashboard: {
        version: 2,
        dashboards,
        activeDashboardId,
        layoutsById,
      },
    }),
    [dashboards, activeDashboardId, layoutsById]
  );

  const payloadJson = useMemo(() => JSON.stringify(payload), [payload]);

  // -------- Load once on mount --------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setStatus("loading");
      setError(null);
      hydratingRef.current = true;

      try {
        const row = await getDashboardState(); // UserStateRow
        const parsed = parseRowState(row?.state);
        const serverDash = parsed?.dashboard;

        if (serverDash?.version === 2) {
          const ok =
            looksLikeDashboardMetaArray(serverDash.dashboards) &&
            typeof serverDash.activeDashboardId === "string" &&
            looksLikeLayoutsById(serverDash.layoutsById);

          if (ok) {
            // Hydrate the entire store
            useDashboardWidgetsStore.setState((s) => {
              const nextDashboards = serverDash.dashboards;
              const nextActive = serverDash.activeDashboardId;
              const nextLayouts = serverDash.layoutsById;

              // safety: ensure active exists
              const activeExists = nextDashboards.some((d: DashboardMeta) => d.id === nextActive);
              const safeActive = activeExists ? nextActive : nextDashboards[0]?.id ?? s.activeDashboardId;

              return {
                ...s,
                dashboards: nextDashboards,
                activeDashboardId: safeActive,
                layoutsById: nextLayouts,
                items: nextLayouts[safeActive] ?? [],
              };
            });

            lastSavedRef.current = JSON.stringify(parsed);
          } else {
            // Server state malformed → keep local as baseline
            lastSavedRef.current = payloadJson;
          }
        } else {
          // If server is empty / old / missing, keep local as baseline
          lastSavedRef.current = payloadJson;
        }

        if (mounted) setStatus("idle");
      } catch (e: any) {
        if (mounted) {
          setStatus("error");
          setError(e?.message ?? "Failed to load dashboard");
        }
      } finally {
        setTimeout(() => {
          hydratingRef.current = false;
        }, 0);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Debounced autosave on change --------
  useEffect(() => {
    if (hydratingRef.current) return;

    if (payloadJson === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setStatus("saving");
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        await setDashboardState(payload);
        lastSavedRef.current = payloadJson;

        setStatus("saved");
        setTimeout(() => setStatus("idle"), 800);
      } catch (e: any) {
        setStatus("error");
        setError(e?.message ?? "Failed to save dashboard");
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [payloadJson, payload, debounceMs]);

  // -------- Flush pending save on background --------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "background") return;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;

        if (!hydratingRef.current && payloadJson !== lastSavedRef.current) {
          (async () => {
            try {
              setStatus("saving");
              await setDashboardState(payload);
              lastSavedRef.current = payloadJson;
              setStatus("idle");
            } catch (e: any) {
              setStatus("error");
              setError(e?.message ?? "Failed to save dashboard");
            }
          })();
        }
      }
    });

    return () => sub.remove();
  }, [payloadJson, payload]);

  return { status, error };
}
