import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Modal, TextInput } from "react-native";

import {
  AddMode,
  kindOptions,
  sizeOptions,
  headerIconOptions,
  TILEKIND_TO_DEVICEKINDS,
} from "@/lib/editDashboard/dashboardTypes";

import type {
  DashboardItem,
  TileKind,
  WidgetSize,
} from "@/lib/storage/dashboardWidgetStore";

import type { ApiDevice } from "@/lib/api/devices";

type Props = {
  visible: boolean;
  onClose: () => void;

  // When editing: pass the item. When adding: null.
  editingItem: DashboardItem | null;
  setEditingItem: (x: DashboardItem | null) => void;

  // Autocomplete results computed in the screen via your hook
  devicesLoading: boolean;
  entitySuggestions: ApiDevice[];

  // Store actions (passed in so modal can save)
  addHeader: (title: string, iconPath?: string) => void;
  addTile: (tile: {
    title: string;
    kind: TileKind;
    size: WidgetSize;
    entityId?: string;
  }) => void;
  updateItem: (id: string, patch: Partial<DashboardItem>) => void;

  // So the parent can open the modal in “Add” mode cleanly
  openAddSignal?: number;
};

export default function AddEditModal({
  visible,
  onClose,
  editingItem,
  setEditingItem,
  devicesLoading,
  entitySuggestions,
  addHeader,
  addTile,
  updateItem,
  openAddSignal,
}: Props) {
  // Modal mode (only matters when adding)
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

  const resetToAddDefaults = () => {
    setEditingItem(null);

    setAddMode("tile");
    setNewTitle("New widget");
    setNewKind("light");
    setNewSize("large");
    setNewEntityId("");

    setEntityQuery("");
    setEntityPickerOpen(false);

    setNewHeaderTitle("New section");
    setNewHeaderIconPath(undefined);
  };

  // When parent wants to open a clean “Add” modal, it can bump openAddSignal
  useEffect(() => {
    if (!openAddSignal) return;
    resetToAddDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddSignal]);

  // When editingItem changes (open edit), preload fields
  useEffect(() => {
    if (!editingItem) return;

    if (editingItem.type === "header") {
      setAddMode("header");
      setNewHeaderTitle(editingItem.title);
      setNewHeaderIconPath(editingItem.iconPath);
      setEntityPickerOpen(false);
    } else {
      setAddMode("tile");
      setNewTitle(editingItem.title);
      setNewKind(editingItem.kind);
      setNewSize(editingItem.size);

      const eid = editingItem.entityId ?? "";
      setNewEntityId(eid);
      setEntityQuery(eid);
      setEntityPickerOpen(false);
    }
  }, [editingItem]);

  const onSave = () => {
    const trimmedEntity = newEntityId.trim();

    // validation: if entity is set, ensure it matches selected kind
    if (addMode === "tile" && trimmedEntity) {
      const allowed = TILEKIND_TO_DEVICEKINDS[newKind];
      const matchesType =
        newKind === "generic" ||
        allowed.some((k) => trimmedEntity.startsWith(k + "."));
      if (!matchesType) return;
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

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={() => {
          // tap outside closes dropdown, keeps modal open
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
            <Pressable onPress={onClose} hitSlop={12}>
              <Text className="text-black font-semibold">Close</Text>
            </Pressable>
          </View>

          {/* Mode (only when adding) */}
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
                <View
                  style={{ maxHeight: 260 }}
                  className="mt-2 border border-gray-200 rounded-2xl overflow-hidden"
                >
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

              {entityPickerOpen &&
                entityQuery.length > 0 &&
                entitySuggestions.length === 0 && (
                  <Text className="text-gray-500 text-xs mt-2">
                    No matching {newKind} devices found.
                  </Text>
                )}

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
              onPress={onClose}
              className="px-4 py-3 rounded-2xl bg-gray-100"
            >
              <Text className="text-black font-semibold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              className="px-4 py-3 rounded-2xl bg-black"
            >
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
  );
}
