// app/(drawer)/(tabs)/mainDashboard.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { useDashboardWidgetsStore, buildLayoutFromItems } from "@/lib/storage/dashboardWidgetStore";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

import LargeLightTile from "@/components/ui/LargeLightTile";
import SmallLightTile from "@/components/ui/SmallLightTile";
import LargeClimateTile from "@/components/ui/LargeClimateTile";
import SmallFanTile from "@/components/ui/SmallFanTile";
import SmallCoverTile from "@/components/ui/SmallCoverTile";

import { getCurrentState, type HAState } from "@/lib/api/state";
import { setLight } from "@/lib/api/light";

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

type FullRow = { id: string; type: "full"; variant: Variant; item: Tile };
type TwoRow = { id: string; type: "two"; variant: Variant; items: [Tile, Tile] };
type SplitRow = {
  id: string;
  type: "split";
  left: Tile & { variant: "large" };
  right: [(Tile & { variant: "small" }), (Tile & { variant: "small" })];
};
type HeaderRow = { id: string; type: "header"; title: string; iconPath?: string };

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

  lightOnMap,
  lightValues,
  setLightValue,
    onToggleLight,

  climateSetTempMap,

  fanPctMap,
  coverPosMap,
}: {
  tile: Tile;
  variant: Variant;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  setLightValue: (entityId: string | undefined, v: number) => void;
  onToggleLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;

  fanPctMap: Record<string, number>;
  coverPosMap: Record<string, number>;
}) {
  switch (tile.kind) {
    case "light": {
      const entityId = tile.entityId ?? "";
      const isOn = entityId ? !!lightOnMap[entityId] : false;
      const v = entityId ? lightValues[entityId] ?? 0 : 0;

      if (variant === "large") {
        return (
          <LargeLightTile
            title={tile.title}
            entityId={entityId}
            value={v}
            onChange={(next) => {setLightValue(tile.entityId, next)}}
            onMenuPress={() => console.log("menu")}
            showBlueBorder
          />
        );
      }

      return (
        <SmallLightTile
          title={tile.title}
          entityId={entityId}
          isOn={isOn}
          onPress={() => onToggleLight(entityId)}
          onMenuPress={() => console.log("menu")}
          showBlueBorder={false}
        />
      );
    }

    case "climate": {
      if (variant !== "large") return <DashboardTile tile={tile} variant={variant} />;

      const entityId = tile.entityId ?? "";
      const setTemp = entityId ? climateSetTempMap[entityId] ?? 23 : 23;

      return (
        <LargeClimateTile
          title={tile.title}
          mode="cool"
          setTemp={setTemp}
          onChangeSetTemp={(t) => {
            // TODO: call your climate control endpoint when you have it
            console.log("Set climate temp", entityId, t);
          }}
        />
      );
    }

    case "fan":
      if (variant === "small") {
        const entityId = tile.entityId ?? "";
        const pct = entityId ? fanPctMap[entityId] ?? 0 : 0;
        return (
          <SmallFanTile
            title={tile.title}
            percentage={pct}
            onChangePercentage={(nextPct) => {
              // TODO: call your fan control endpoint when you have it
              console.log("Set fan %", entityId, nextPct);
            }}
            onMenuPress={() => console.log("fan menu")}
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    case "cover":
      if (variant === "small") {
        const entityId = tile.entityId ?? "";
        const pos = entityId ? coverPosMap[entityId] ?? 0 : 0;
        return (
          <SmallCoverTile
            title={tile.title}
            position={pos}
            onChangePosition={(nextPos) => {
              // TODO: call your cover control endpoint when you have it
              console.log("Set cover position", entityId, nextPos);
            }}
            onMenuPress={() => console.log("Blinds menu")}
          />
        );
      }
      return <DashboardTile tile={tile} variant={variant} />;

    default:
      return <DashboardTile tile={tile} variant={variant} />;
  }
}

// --------------------------------
// Row Renderer (LAYOUT ONLY)
// --------------------------------
function RenderRow({
  row,

  lightOnMap,
  lightValues,
  setLightValue,
    onToggleLight,

  climateSetTempMap,

  fanPctMap,
  coverPosMap,
}: {
  row: DashboardRow;

  lightOnMap: Record<string, boolean>;
  lightValues: Record<string, number>;
  setLightValue: (entityId: string | undefined, v: number) => void;
  onToggleLight: (entityId: string) => void;

  climateSetTempMap: Record<string, number>;

  fanPctMap: Record<string, number>;
  coverPosMap: Record<string, number>;
}) {
  switch (row.type) {
    case "header":
      return <SectionHeader title={row.title} iconPath={row.iconPath} />;

    case "full":
      return (
        <RenderTile
          tile={row.item}
          variant={row.variant}
          lightOnMap={lightOnMap}
          lightValues={lightValues}
          setLightValue={setLightValue}
          onToggleLight={onToggleLight}
          climateSetTempMap={climateSetTempMap}
          fanPctMap={fanPctMap}
          coverPosMap={coverPosMap}
        />
      );

    case "two":
      return (
        <View className="flex-row" style={{ gap: GAP }}>
          <View className="flex-1">
            <RenderTile
              tile={row.items[0]}
              variant={row.variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              setLightValue={setLightValue}
              onToggleLight={onToggleLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
            />
          </View>
          <View className="flex-1">
            <RenderTile
              tile={row.items[1]}
              variant={row.variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              setLightValue={setLightValue}
              onToggleLight={onToggleLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
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
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              setLightValue={setLightValue}
              onToggleLight={onToggleLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
            />
          </View>

          <View className="flex-1" style={{ gap: GAP }}>
            <RenderTile
              tile={row.right[0]}
              variant={row.right[0].variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              setLightValue={setLightValue}
              onToggleLight={onToggleLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
            />
            <RenderTile
              tile={row.right[1]}
              variant={row.right[1].variant}
              lightOnMap={lightOnMap}
              lightValues={lightValues}
              setLightValue={setLightValue}
              onToggleLight={onToggleLight}
              climateSetTempMap={climateSetTempMap}
              fanPctMap={fanPctMap}
              coverPosMap={coverPosMap}
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
  const items = useDashboardWidgetsStore((s) => s.items);
  const layout = useMemo(() => buildLayoutFromItems(items), [items]);

  const [lightValues, setLightValues] = useState<Record<string, number>>({});
  const [pendingLights, setPendingLights] = useState<Set<string>>(new Set());


  const setLightValue = (entityId: string | undefined, v: number) => {
    if (!entityId) return;
    setLightValues((prev) => ({...prev, [entityId]: v}));
  };

  // ---- Extract entity IDs shown on dashboard ----
  const dashboardEntityIds = useMemo(() => {
    const ids = new Set<string>();

    for (const row of layout) {
      if (row.type === "full") {
        if (row.item.entityId) ids.add(row.item.entityId);
      } else if (row.type === "two") {
        row.items.forEach((t) => t.entityId && ids.add(t.entityId));
      } else if (row.type === "split") {
        if (row.left.entityId) ids.add(row.left.entityId);
        row.right.forEach((t) => t.entityId && ids.add(t.entityId));
      }
    }

    return Array.from(ids);
  }, [layout]);

  // ---- State maps driven by polling ----
  const [lightOnMap, setLightOnMap] = useState<Record<string, boolean>>({});
  const [lightBrightnessMap, setLightBrightnessMap] = useState<Record<string, number>>({});
  const [climateSetTempMap, setClimateSetTempMap] = useState<Record<string, number>>({});
  const [fanPctMap, setFanPctMap] = useState<Record<string, number>>({});
  const [coverPosMap, setCoverPosMap] = useState<Record<string, number>>({});

  // ---- Polling loop (every 5s, only while screen is focused) ----
  useFocusEffect(
      React.useCallback(() => {
        if (dashboardEntityIds.length === 0) return;

        const wanted = new Set(dashboardEntityIds);
        let alive = true;
        let timer: any = null;

        const poll = async () => {
          try {
            const all = await getCurrentState();
            if (!alive) return;

            // filter to only those on dashboard
            const states = all.filter((s) => wanted.has(s.entity_id));

            const nextLightOn: Record<string, boolean> = {};
            const nextLightValues: Record<string, number> = {};
            const nextClimateTemp: Record<string, number> = {};
            const nextFanPct: Record<string, number> = {};
            const nextCoverPos: Record<string, number> = {};

            for (const s of states) {
              const domain = s.entity_id.split(".")[0];
              const attrs = s.attributes ?? {};

              if (domain === "light") {
                nextLightOn[s.entity_id] = s.state === "on";

                if (typeof attrs.brightness === "number") {
                  nextLightValues[s.entity_id] = Math.max(0, Math.min(1, attrs.brightness / 255)); //Converts to 0-100 scale
                } else {
                  // if light is off, HA may omit brightness
                  // keep previous unless you want to force 0:
                  // nextLightBri[s.entity_id] = 0;
                }
              }

              if (domain === "climate") {
                if (typeof attrs.temperature === "number") {
                  nextClimateTemp[s.entity_id] = attrs.temperature;
                }
              }

              if (domain === "fan") {
                // HA often uses attributes.percentage
                if (typeof attrs.percentage === "number") {
                  nextFanPct[s.entity_id] = attrs.percentage;
                } else {
                  // fallback
                  nextFanPct[s.entity_id] = s.state === "on" ? 100 : 0;
                }
              }

              if (domain === "cover") {
                // HA commonly uses attributes.current_position
                if (typeof attrs.current_position === "number") {
                  nextCoverPos[s.entity_id] = attrs.current_position;
                }
              }
            }

            setLightOnMap((prev) => ({...prev, ...nextLightOn}));
            setLightBrightnessMap((prev) => ({...prev, ...nextLightValues}));
            setClimateSetTempMap((prev) => ({...prev, ...nextClimateTemp}));
            setFanPctMap((prev) => ({...prev, ...nextFanPct}));
            setCoverPosMap((prev) => ({...prev, ...nextCoverPos}));
          } catch (e) {
            // optional log
            // console.log("poll failed", e);
          } finally {
            if (!alive) return;
            timer = setTimeout(poll, 5000);
          }
        };

        poll();

        return () => {
          alive = false;
          if (timer) clearTimeout(timer);
        };
      }, [dashboardEntityIds])
  );
  const refreshState = async () => {
    try {
      const all = await getCurrentState();
      const wanted = new Set(dashboardEntityIds);
      const states = all.filter((s) => wanted.has(s.entity_id));

      const nextLightOn: Record<string, boolean> = {};
      const nextLightValues: Record<string, number> = {};

      for (const s of states) {
        const domain = s.entity_id.split(".")[0];
        const attrs = s.attributes ?? {};

        if (domain === "light") {
          nextLightOn[s.entity_id] = s.state === "on";
          if (typeof attrs.brightness === "number") {
            nextLightValues[s.entity_id] = attrs.brightness / 255;
          }
        }
      }
      setLightOnMap((prev) => ({...prev, ...nextLightOn}));
      setLightValues((prev) => ({...prev, ...nextLightValues}));
    } catch(e) {
      console.log("refreshState failed", e);
    }
  };

  const onToggleLight = async (entityId: string) => {
    console.log("Running on toggle")
    const current = !!lightOnMap[entityId];
    const next: "on" | "off" = current ? "off" : "on";

    setLightOnMap((prev) => ({ ...prev, [entityId]: next === "on" }));

    try {
      await setLight({ entity_id: entityId, state: next });
      await refreshState();
    } catch (e) {
      setLightOnMap((prev) => ({ ...prev, [entityId]: current }));
    }
  };

  const onSetLightBrightness = async (entityId: string, brightness: number) => {
    const b = Math.max(0, Math.min(255, Math.round(brightness)));

    // optimistic
    setLightBrightnessMap((prev) => ({ ...prev, [entityId]: b }));
    setLightOnMap(prev => {
      const merged = { ...prev };
      for (const [id, val] of Object.entries(nextLightOn)) {
        if (!pendingLights.has(id)) {
          merged[id] = val;
        }
      }
      return merged;
    });

        try {
          await setLight({
            entity_id: entityId,
            state: b > 0 ? "on" : "off",
            brightness: b > 0 ? b : undefined,
          });
        } catch (e) {
          // don’t know previous here unless you store it — polling will correct in <=5s
          // If you want perfect revert, keep a local "previous" snapshot.
        }
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
                        lightOnMap={lightOnMap}
                        lightValues={lightValues}
                        setLightValue={setLightValue}
                        onToggleLight={onToggleLight}
                        climateSetTempMap={climateSetTempMap}
                        fanPctMap={fanPctMap}
                        coverPosMap={coverPosMap}
                    />
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
      );
  }
