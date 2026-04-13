import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import clsx from "clsx";

import { MaterialIcons } from "@expo/vector-icons";
import { mdiFan } from "@mdi/js";

import Card from "@/components/dashboard/Card";
import MdiIcon from "@/components/general/MdiIcon";
import { setFan } from "@/lib/api/deviceControllers/fan";

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

type FanLevel = "off" | "low" | "medium" | "high";

type Props = {
  title: string;
  entityId: string;
  percentage?: number; // 0..100
  onChangePercentage?: (pct: number) => void;
  onMenuPress?: () => void;
  showBlueBorder?: boolean;
};

// Map backend percentage -> level for display
function percentageToLevel(pct: number | undefined): FanLevel {
  const p = clamp(Math.round(pct ?? 0), 0, 100);
  if (p === 0) return "off";
  if (p <= 33) return "low";
  if (p <= 66) return "medium";
  return "high";
}

// Map level -> canonical percentage for backend / store
function levelToPercentage(level: FanLevel): number {
  switch (level) {
    case "off":
      return 0;
    case "low":
      return 33;
    case "medium":
      return 66;
    case "high":
      return 100;
  }
}

export default function SmallFanTile({
  title,
  entityId,
  percentage,
  onChangePercentage,
  onMenuPress,
  showBlueBorder = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const level = percentageToLevel(percentage);
  const pct = levelToPercentage(level);
  const isOn = level !== "off";

  const subtitle = useMemo(() => {
    if (level === "off") return "Off";
    return `${level.charAt(0).toUpperCase() + level.slice(1)} • ${pct}%`;
    }, [level, pct]);

  const sendToBackend = async (nextPct: number) => {
    const finalPct = clamp(Math.round(nextPct), 0, 100);
    try {
      if (finalPct <= 0) {
        await setFan({
          entity_id: entityId,
          state: "off",
          percentage: 0,
        });
      } else {
        await setFan({
          entity_id: entityId,
          state: "on",
          percentage: finalPct,
        });
      }
    } catch (e) {
      console.log("Fan API error:", String(e));
    }
  };

  const handleSelectLevel = async (nextLevel: FanLevel) => {
    setMenuOpen(false);
    const nextPct = levelToPercentage(nextLevel);

    onChangePercentage?.(nextPct);

    await sendToBackend(nextPct);
  };

  const levels: FanLevel[] = ["off", "low", "medium", "high"];

  return (
      <Card
          variant="small"
          allowOverflow
          className={clsx(
              showBlueBorder && "border border-blue-500",
              menuOpen && "z-50"
          )}
      >
        <View className="flex-1">
          {/* top-right menu */}
          <View style={{ position: "absolute", top: 2, right: 2, zIndex: 20 }}>
            <Pressable onPress={onMenuPress} hitSlop={10}>
              <MaterialIcons name="more-vert" size={24} color="#111" />
            </Pressable>
          </View>

          {/* icon + title */}
          <View className="flex-row items-center">
            <View className="pr-2 pt-1">
              <MdiIcon path={mdiFan} size={30} color={isOn ? "#4985EE" : "#7A7A7A"} />
            </View>
            <View className="flex-1 pr-[24px]">
              <Text
                  numberOfLines={1}
                  className="text-body font-medium text-black"
                  style={{ lineHeight: 18 }}
              >
                {title}
              </Text>
              <Text
                  numberOfLines={1}
                  className="text-subtext font-medium"
                  style={{ color: isOn ? "#4985EE" : "#7A7A7A" }}
              >
                {subtitle}
              </Text>
            </View>
          </View>

          {/* dropdown pill */}
          <View className="mt-1" style={{ position: "relative" }}>
            <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                className="flex-row items-center justify-between rounded-full px-3 py-1 color-transparent border"
                style={{ borderColor: isOn ? "#4985EE" : "#7A7A7A" }}
            >
              <View className="flex-row items-center">
                <MaterialIcons
                    name="tune"
                    size={18}
                    color={isOn ? "#4985EE" : "#7A7A7A"}
                    style={{ marginRight: 6 }}
                />
                <Text
                    className="text-[13px] text-black font-medium"
                    style={{ color: isOn ? "#4985EE" : "#7A7A7A" }}
                >
                  {level === "off"
                      ? "Off"
                      : level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </View>
              <MaterialIcons
                  name={menuOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                  size={20}
                  color={isOn ? "#4985EE" : "#7A7A7A"}
              />
            </Pressable>

            {menuOpen && (
                <View
                    className="mt-1 rounded-2xl bg-white overflow-hidden shadow-lg shadow-black"
                    style={{
                          position: "absolute",
                          top: 40,
                          left: 0,
                          right: 0,
                          zIndex: 1000
                }}
                >

                  {levels.map((lvl) => {
                    const selected = lvl === level;
                    return (
                        <Pressable
                            key={lvl}
                            onPress={() => handleSelectLevel(lvl)}
                            className="flex-row items-center px-3 py-2"
                        >
                          {/* dot indicator */}
                          <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginRight: 10,
                                backgroundColor: selected ? "#4985EE" : "#7A7A7A",
                              }}
                          />
                          <Text
                              className="text-[13px]"
                              style={{
                                color: selected ? "#000000" : "#7A7A7A",
                                fontWeight: selected ? "600" : "400",
                                textTransform: "capitalize",
                              }}
                          >
                            {lvl}
                          </Text>
                        </Pressable>
                    );
                  })}
                </View>
            )}
          </View>
        </View>
      </Card>
  );
}

