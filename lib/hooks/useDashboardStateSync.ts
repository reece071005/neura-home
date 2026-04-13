import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { useDashboardWidgetsStore, type DashboardItem } from "@/lib/storage/dashboardWidgetStore";
import { setDashboardState } from "@/lib/api/userState";

type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

export type DashboardStateV2 = {
  dashboard: {
    version: 2;
    dashboards: { id: string; name: string; iconPath?: string }[];
    activeDashboardId: string;
    layoutsById: Record<string, DashboardItem[]>;
  };
};

export function useDashboardStateSync(opts?: { debounceMs?: number }) {
  const debounceMs = opts?.debounceMs ?? 800;

  // pull the dashboard state from store
  const dashboards = useDashboardWidgetsStore((s) => s.dashboards);
  const activeDashboardId = useDashboardWidgetsStore((s) => s.activeDashboardId);
  const layoutsById = useDashboardWidgetsStore((s) => s.layoutsById);

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Guard flag retained so autosave can be temporarily paused if needed.
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

  useEffect(() => {
    lastSavedRef.current = payloadJson;
    setStatus("idle");
  }, []);

  // Debounced autosave on change
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
