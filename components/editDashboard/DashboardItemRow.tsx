import React from "react";
import { Pressable, Text, View } from "react-native";
import type { RenderItemParams } from "react-native-draggable-flatlist";

import type { DashboardItem, WidgetSize } from "@/lib/storage/dashboardWidgetStore";
import { SUPPORTED_SIZES_BY_KIND } from "@/lib/editDashboard/dashboardTypes";

type Props = {
  item: DashboardItem;
  drag: RenderItemParams<DashboardItem>["drag"];
  isActive: boolean;

  sizeOptions: WidgetSize[];

  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<DashboardItem, "id" | "type">>) => void;

  // “Edit” is handled by the parent because it sets a bunch of local state + opens modal
  onEditHeader: (item: Extract<DashboardItem, { type: "header" }>) => void;
  onEditTile: (item: Extract<DashboardItem, { type: "tile" }>) => void;
};

export default function DashboardItemRow({
  item,
  drag,
  isActive,
  sizeOptions,
  onRemove,
  onUpdate,
  onEditHeader,
  onEditTile,
}: Props) {
  // HEADER ITEM
  if (item.type === "header") {
    return (
      <Pressable
        onLongPress={drag}
        delayLongPress={150}
        className={`border rounded-3xl p-4 mb-3 ${
          isActive ? "border-black" : "border-gray-200"
        }`}
        style={{ opacity: isActive ? 0.85 : 1 }}
      >
        <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="text-black font-bold text-base">Header: {item.title}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {item.iconPath ? "icon set" : "no icon"}
            </Text>
          </View>

          <Pressable
            onPress={() => onRemove(item.id)}
            className="px-3 py-2 rounded-2xl bg-red-50"
          >
            <Text className="text-red-600 font-semibold">Remove</Text>
          </Pressable>
        </View>

        {/* Quick edit */}
        <View className="mt-3">
          <Pressable
            onPress={() => onEditHeader(item)}
            className="px-3 py-2 rounded-2xl bg-gray-100 self-start"
          >
            <Text className="text-black font-semibold">Edit</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  // TILE ITEM
  const availableSizes = SUPPORTED_SIZES_BY_KIND[item.kind] ?? ["small"];

  return (
    <Pressable
      onLongPress={drag}
      delayLongPress={150}
      className={`border rounded-3xl p-4 mb-3 ${
        isActive ? "border-black" : "border-gray-200"
      }`}
      style={{ opacity: isActive ? 0.85 : 1 }}
    >
      {/* Top line */}
      <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
        <View className="flex-1">
          <Text className="text-black font-bold text-base">{item.title}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            {item.kind} • {item.size}
            {item.entityId ? ` • ${item.entityId}` : ""}
          </Text>
        </View>

        <Pressable
          onPress={() => onRemove(item.id)}
          className="px-3 py-2 rounded-2xl bg-red-50"
        >
          <Text className="text-red-600 font-semibold">Remove</Text>
        </Pressable>
      </View>

      {/* Actions */}
      <View className="flex-row items-center justify-between mt-3">
        {/* Size toggle */}
        <View className="flex-row" style={{ gap: 8 }}>
          {sizeOptions.map((s) => {
            const active = item.size === s;
            const supported = availableSizes.includes(s);
            return (
              <Pressable
                key={s}
                disabled={!supported}
                onPress={() => {
                  if (!supported) return;
                  onUpdate(item.id, { size: s });
                }}
                className={`px-3 py-2 rounded-full border ${
                  active
                    ? "bg-black border-black"
                    : supported
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 border-gray-200"
                }`}
                style={({ pressed }) => ({ opacity: pressed && supported ? 0.8 : 1 })}
              >
                <Text className={active ? "text-white" : supported ? "text-black" : "text-gray-400"}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Edit */}
        <Pressable
          onPress={() => onEditTile(item)}
          className="px-3 py-2 rounded-2xl bg-gray-100"
        >
          <Text className="text-black font-semibold">Edit</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
