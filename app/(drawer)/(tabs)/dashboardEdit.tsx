import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import * as mdi from "@mdi/js";

import {
  useDashboardWidgetsStore,
  type DashboardItem,
  type TileKind,
  type WidgetSize,
} from "@/lib/storage/dashboardWidgetStore";

import { listDevices, type ApiDevice } from "@/lib/api/devices";

// --------------------
// Options
// --------------------
const kindOptions: TileKind[] = [
  "light",
  "climate",
  "fan",
  "cover",
  "lock",
  "camera",
  "media",
  "generic",
];

const sizeOptions: WidgetSize[] = ["small", "large"];

// super simple icon picker (expand later)
const headerIconOptions: { label: string; iconPath?: string }[] = [
  { label: "None", iconPath: undefined },
  { label: "Sofa", iconPath: mdi.mdiSofa },
  { label: "Bed", iconPath: mdi.mdiBedEmpty },
  { label: "Kitchen", iconPath: mdi.mdiSilverwareForkKnife },
  { label: "Bath", iconPath: mdi.mdiShower },
];

type AddMode = "tile" | "header";

// Map dashboard TileKind -> devices API kinds
const TILEKIND_TO_DEVICEKINDS: Record<TileKind, ApiDevice["kind"][]> = {
  light: ["light"],
  climate: ["climate"],
  fan: ["fan"],
  cover: ["cover"],
  lock: [], // backend doesn't return lock in ApiDevice.kind yet
  camera: ["camera"],
  media: ["media_player"],
  generic: [
    "light",
    "fan",
    "switch",
    "cover",
    "climate",
    "media_player",
    "camera",
    "sensor",
    "binary_sensor",
  ],
};

export default function EditDashboard() {
  // --------------------
  // Store
  // --------------------
  const items = useDashboardWidgetsStore((s) => s.items);
  const setItems = useDashboardWidgetsStore((s) => s.setItems);
  const removeItem = useDashboardWidgetsStore((s) => s.removeItem);
  const updateItem = useDashboardWidgetsStore((s) => s.updateItem);
  const addHeader = useDashboardWidgetsStore((s) => s.addHeader);
  const addTile = useDashboardWidgetsStore((s) => s.addTile);

  // --------------------
  // Devices for autocomplete
  // --------------------
  const [devices, setDevices] = useState<ApiDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setDevicesLoading(true);

    listDevices()
      .then((res) => {
        if (mounted) setDevices(res);
      })
      .catch(() => {
        if (mounted) setDevices([]);
      })
      .finally(() => {
        if (mounted) setDevicesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // --------------------
  // Editing state
  // --------------------
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("tile");

  // Tile fields
  const [newTitle, setNewTitle] = useState("New widget");
  const [newKind, setNewKind] = useState<TileKind>("light");
  const [newSize, setNewSize] = useState<WidgetSize>("large");
  const [newEntityId, setNewEntityId] = useState("");

  // Entity picker state (typeahead)
  const [entityQuery, setEntityQuery] = useState("");
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);

  // Header fields
  const [newHeaderTitle, setNewHeaderTitle] = useState("New section");
  const [newHeaderIconPath, setNewHeaderIconPath] = useState<string | undefined>(
    undefined
  );

  const openAdd = () => {
    setEditingItem(null);

    // reset modal defaults each open
    setAddMode("tile");
    setNewTitle("New widget");
    setNewKind("light");
    setNewSize("large");
    setNewEntityId("");

    setEntityQuery("");
    setEntityPickerOpen(false);

    setNewHeaderTitle("New section");
    setNewHeaderIconPath(undefined);

    setModalOpen(true);
  };

  const entitySuggestions = useMemo(() => {
    const q = entityQuery.trim().toLowerCase();
    const allowed = TILEKIND_TO_DEVICEKINDS[newKind];

    if (!allowed || allowed.length === 0) return [];

    return devices
      .filter((d) => allowed.includes(d.kind))
      .filter((d) => {
        if (!q) return true;
        return (
          d.entity_id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q) ||
          (d.area?.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, 10);
  }, [devices, entityQuery, newKind]);

  const onAdd = () => {
    // Optional validation: if entity is set, ensure it matches selected kind
    const trimmedEntity = newEntityId.trim();
    if (addMode === "tile" && trimmedEntity) {
      const allowed = TILEKIND_TO_DEVICEKINDS[newKind];
      const matchesType =
        newKind === "generic" ||
        allowed.some((k) => trimmedEntity.startsWith(k + "."));

      // if lock has no allowed kinds, treat as invalid if they typed something
      if (!matchesType) {
        // You can replace this with a nicer inline error state if you want
        return;
      }
    }

    if (editingItem) {
      if (editingItem.type === "header") {
        updateItem(editingItem.id, {
          title: newHeaderTitle.trim() || "Section",
          iconPath: newHeaderIconPath,
        });
      } else {
        updateItem(editingItem.id, {
          title: newTitle.trim() || "Widget",
          kind: newKind,
          size: newSize,
          entityId: trimmedEntity || undefined,
        });
      }
    } else {
      if (addMode === "header") {
        addHeader(newHeaderTitle.trim() || "Section", newHeaderIconPath);
      } else {
        addTile({
          title: newTitle.trim() || "Widget",
          kind: newKind,
          size: newSize,
          entityId: trimmedEntity || undefined,
        });
      }
    }

    setModalOpen(false);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DashboardItem>) => {
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
              <Text className="text-black font-bold text-base">
                Header: {item.title}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                {item.iconPath ? "icon set" : "no icon"}
              </Text>
            </View>

            <Pressable
              onPress={() => removeItem(item.id)}
              className="px-3 py-2 rounded-2xl bg-red-50"
            >
              <Text className="text-red-600 font-semibold">Remove</Text>
            </Pressable>
          </View>

          {/* Quick edit */}
          <View className="mt-3">
            <Pressable
              onPress={() => {
                setEditingItem(item);
                setAddMode("header");

                setNewHeaderTitle(item.title);
                setNewHeaderIconPath(item.iconPath);

                // close entity picker if it was open
                setEntityPickerOpen(false);

                setModalOpen(true);
              }}
              className="px-3 py-2 rounded-2xl bg-gray-100 self-start"
            >
              <Text className="text-black font-semibold">Edit</Text>
            </Pressable>
          </View>
        </Pressable>
      );
    }

    // TILE ITEM
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
            onPress={() => removeItem(item.id)}
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
              return (
                <Pressable
                  key={s}
                  onPress={() => updateItem(item.id, { size: s })}
                  className={`px-3 py-2 rounded-full border ${
                    active ? "bg-black border-black" : "bg-white border-gray-300"
                  }`}
                >
                  <Text className={active ? "text-white" : "text-black"}>{s}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Edit */}
          <Pressable
            onPress={() => {
              setEditingItem(item);
              setAddMode("tile");

              setNewTitle(item.title);
              setNewKind(item.kind);
              setNewSize(item.size);

              const eid = item.entityId ?? "";
              setNewEntityId(eid);
              setEntityQuery(eid);
              setEntityPickerOpen(false);

              setModalOpen(true);
            }}
            className="px-3 py-2 rounded-2xl bg-gray-100"
          >
            <Text className="text-black font-semibold">Edit</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-black font-semibold">Back</Text>
        </Pressable>

        <Text className="text-black text-lg font-bold">Edit dashboard</Text>

        <Pressable onPress={openAdd} hitSlop={12}>
          <Text className="text-black font-semibold">Add</Text>
        </Pressable>
      </View>

      {/* Draggable list */}
      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setItems(data)}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
          paddingTop: 16,
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => {
            // tap outside to close dropdown, but keep modal open
            setEntityPickerOpen(false);
          }}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-lg font-bold">
                {editingItem ? "Edit" : "Add"}
              </Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={12}>
                <Text className="text-black font-semibold">Close</Text>
              </Pressable>
            </View>

            {/* Mode */}
            {!editingItem && (
              <>
                <Text className="text-gray-600 mt-4 mb-2">
                  What do you want to add?
                </Text>
                <View className="flex-row" style={{ gap: 8 }}>
                  {(["tile", "header"] as AddMode[]).map((m) => {
                    const active = addMode === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => {
                          setAddMode(m);
                          setEntityPickerOpen(false);
                        }}
                        className={`px-3 py-2 rounded-full border ${
                          active
                            ? "bg-black border-black"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>
                          {m === "tile" ? "Widget" : "Header"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* HEADER FORM */}
            {addMode === "header" && (
              <>
                <Text className="text-gray-600 mt-4 mb-2">Header title</Text>
                <TextInput
                  value={newHeaderTitle}
                  onChangeText={setNewHeaderTitle}
                  placeholder="e.g. Living Room"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
                />

                <Text className="text-gray-600 mt-4 mb-2">Icon</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {headerIconOptions.map((opt) => {
                    const active = newHeaderIconPath === opt.iconPath;
                    return (
                      <Pressable
                        key={opt.label}
                        onPress={() => setNewHeaderIconPath(opt.iconPath)}
                        className={`px-3 py-2 rounded-full border ${
                          active
                            ? "bg-black border-black"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* TILE FORM */}
            {addMode === "tile" && (
              <>
                <Text className="text-gray-600 mt-4 mb-2">Title</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Kitchen Lights"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
                  onFocus={() => setEntityPickerOpen(false)}
                />

                <Text className="text-gray-600 mt-4 mb-2">Type</Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {kindOptions.map((k) => {
                    const active = newKind === k;
                    return (
                      <Pressable
                        key={k}
                        onPress={() => {
                          setNewKind(k);
                          // reset entity when type changes
                          setNewEntityId("");
                          setEntityQuery("");
                          setEntityPickerOpen(false);
                        }}
                        className={`px-3 py-2 rounded-full border ${
                          active
                            ? "bg-black border-black"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>
                          {k}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="text-gray-600 mt-4 mb-2">Size</Text>
                <View className="flex-row" style={{ gap: 8 }}>
                  {sizeOptions.map((s) => {
                    const active = newSize === s;
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setNewSize(s)}
                        className={`px-3 py-2 rounded-full border ${
                          active
                            ? "bg-black border-black"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>
                          {s}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="text-gray-600 mt-4 mb-2">Entity ID</Text>

                <TextInput
                  value={entityQuery}
                  onChangeText={(t) => {
                    setEntityQuery(t);
                    setNewEntityId(t);
                    setEntityPickerOpen(true);
                  }}
                  onFocus={() => setEntityPickerOpen(true)}
                  placeholder={
                    devicesLoading
                      ? "Loading devices…"
                      : newKind === "media"
                      ? "e.g. media_player.living_room_tv"
                      : `e.g. ${newKind}.kitchen`
                  }
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Suggestions dropdown */}
                {entityPickerOpen && entitySuggestions.length > 0 && (
                  <View style={{ maxHeight: 260 }} className="mt-2 border border-gray-200 rounded-2xl overflow-hidden">
                    {entitySuggestions.map((d) => (
                      <Pressable
                        key={d.entity_id}
                        onPress={() => {
                          setNewEntityId(d.entity_id);
                          setEntityQuery(d.entity_id);
                          setEntityPickerOpen(false);
                        }}
                        className="px-4 py-3 bg-white"
                      >
                        <Text className="text-black font-semibold">{d.name}</Text>
                        <Text className="text-gray-500 text-xs mt-1">
                          {d.entity_id}
                          {d.area ? ` • ${d.area}` : ""}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Empty state */}
                {entityPickerOpen &&
                  entityQuery.length > 0 &&
                  entitySuggestions.length === 0 && (
                    <Text className="text-gray-500 text-xs mt-2">
                      No matching {newKind} devices found.
                    </Text>
                  )}

                {/* Lock note */}
                {newKind === "lock" && (
                  <Text className="text-gray-500 text-xs mt-2">
                    Locks aren&apos;t returned by /homecontrollers/devices yet. Ask backend
                    to add kind: &quot;lock&quot; if you want locks selectable here.
                  </Text>
                )}
              </>
            )}

            {/* Actions */}
            <View className="flex-row justify-end mt-5" style={{ gap: 10 }}>
              <Pressable
                onPress={() => setModalOpen(false)}
                className="px-4 py-3 rounded-2xl bg-gray-100"
              >
                <Text className="text-black font-semibold">Cancel</Text>
              </Pressable>
              <Pressable onPress={onAdd} className="px-4 py-3 rounded-2xl bg-black">
                <Text className="text-white font-semibold">
                  {editingItem ? "Save" : "Add"}
                </Text>
              </Pressable>
            </View>

            <Text className="text-gray-500 text-xs mt-3">
              Drag headers and widgets to reorder.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
