import { useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { useDashboardWidgetsStore, type DashboardItem } from "@/lib/storage/dashboardWidgetStore";
import { getDashboardState, setDashboardState } from "@/lib/api/userState";

type SyncStatus = "idle" | "loading" | "saving" | "saved" | "error";

function looksLikeItems(x: any): x is DashboardItem[] {
  return Array.isArray(x) && x.every((it) => it && typeof it === "object" && typeof it.id === "string");
}

export function useDashboardStateSync(opts?: { debounceMs?: number }) {
  const debounceMs = opts?.debounceMs ?? 800;

  const items = useDashboardWidgetsStore((s) => s.items);
  const setItems = useDashboardWidgetsStore((s) => s.setItems);

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Prevent autosave firing immediately after we hydrate from server
  const hydratingRef = useRef(false);

  // Track last saved payload so we don't POST unnecessarily
  const lastSavedRef = useRef<string>("");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemsJson = useMemo(() => JSON.stringify(items), [items]);

  // -------- Load once on mount --------
  useEffect(() => {
    let mounted = true;

    (async () => {
      setStatus("loading");
      setError(null);
      hydratingRef.current = true;

      try {
        const row = await getDashboardState();

        const serverItems = row?.state?.dashboard?.items;

        if (looksLikeItems(serverItems) && serverItems.length > 0) {
          setItems(serverItems);
          lastSavedRef.current = JSON.stringify(serverItems);
        } else {
          // no state saved yet → keep local, mark it as baseline
          lastSavedRef.current = itemsJson;
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

    if (itemsJson === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setStatus("saving");
    setError(null);

    timerRef.current = setTimeout(async () => {
      try {
        await setDashboardState({
          dashboard: { version: 1, items },
        });
        lastSavedRef.current = JSON.stringify(items);

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
  }, [itemsJson, items, debounceMs]);

  // -------- Flush pending save on background --------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "background") return;

      // if a save is pending, flush it now
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;

        if (!hydratingRef.current && itemsJson !== lastSavedRef.current) {
          (async () => {
            try {
              setStatus("saving");
              await setDashboardState({ dashboard: { version: 1, items } });
              lastSavedRef.current = JSON.stringify(items);
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
  }, [itemsJson, items]);

  return { status, error };
}
