// components/editDashboard/AddEditModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { AvoidSoftInput, AvoidSoftInputView } from "react-native-avoid-softinput";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AddMode,
  kindOptions,
  sizeOptions,
  SUPPORTED_SIZES_BY_KIND,
  TILEKIND_TO_DEVICEKINDS,
} from "@/lib/editDashboard/dashboardTypes";

import type {
  DashboardItem,
  TileKind,
  WidgetSize,
} from "@/lib/storage/dashboardWidgetStore";

import { useDeviceAutocomplete } from "@/lib/editDashboard/useDeviceAutocomplete";
import { getRooms, type RoomDto } from "@/lib/api/ai/rooms";

import IconPickerModal from "@/components/editDashboard/IconPickerModal";
import MdiIcon from "@/components/general/MdiIcon";

type Props = {
  visible: boolean;
  onClose: () => void;
  editingItem: DashboardItem | null;
  setEditingItem: (x: DashboardItem | null) => void;
  addHeader: (title: string, iconPath?: string) => void;
  addTile: (tile: { title: string; kind: TileKind; size: WidgetSize; entityId?: string }) => void;
  updateItem: (id: string, patch: Partial<DashboardItem>) => void;
  openAddSignal?: number;
};

function PillButton({
  label,
  active,
  onPress,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-3 py-2 rounded-full border ${
        active
          ? "bg-black border-black"
          : disabled
          ? "bg-gray-100 border-gray-200"
          : "bg-white border-gray-300"
      }`}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.8 : 1 })}
    >
      <Text
        className={`font-semibold ${
          active ? "text-white" : disabled ? "text-gray-400" : "text-black"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AddEditModal({
  visible,
  onClose,
  editingItem,
  setEditingItem,
  addHeader,
  addTile,
  updateItem,
  openAddSignal,
}: Props) {
  const insets = useSafeAreaInsets();

  const [addMode, setAddMode] = useState<AddMode>("tile");
  const [newTitle, setNewTitle] = useState("New widget");
  const [newKind, setNewKind] = useState<TileKind>("light");
  const [newSize, setNewSize] = useState<WidgetSize>("large");
  const [newEntityId, setNewEntityId] = useState("");
  const [entityQuery, setEntityQuery] = useState("");
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const { devicesLoading, suggestions } = useDeviceAutocomplete({
    kind: newKind,
    query: entityQuery,
  });
  const entitySuggestions = suggestions ?? [];
  const availableSizes = useMemo(
    () => SUPPORTED_SIZES_BY_KIND[newKind] ?? ["small"],
    [newKind]
  );
  const roomSuggestions = rooms.filter((r) =>
    r.name.toLowerCase().includes(entityQuery.toLowerCase())
  );

  const [newHeaderTitle, setNewHeaderTitle] = useState("New section");
  const [newHeaderIconPath, setNewHeaderIconPath] = useState<string | undefined>(undefined);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  useEffect(() => {
    AvoidSoftInput.setEnabled(visible);
    return () => {
      AvoidSoftInput.setEnabled(false);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    setRoomsLoading(true);
    getRooms()
      .then((data) => setRooms(data))
      .catch(() => setRooms([]))
      .finally(() => setRoomsLoading(false));
  }, [visible]);

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

  useEffect(() => {
    if (!openAddSignal) return;
    resetToAddDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openAddSignal]);

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

  useEffect(() => {
    if (!availableSizes.includes(newSize)) {
      setNewSize(availableSizes[0]);
    }
  }, [availableSizes, newSize]);

  const onSave = () => {
    const trimmedEntity = newEntityId.trim();

    if (addMode === "tile" && newKind === "ai" && !trimmedEntity) {
      return;
    }

    if (addMode === "tile" && newKind !== "ai" && trimmedEntity) {
      const allowed = TILEKIND_TO_DEVICEKINDS[newKind];
      const valid = allowed.some((k) => trimmedEntity.startsWith(k + "."));
      if (!valid) return;
    }

    if (editingItem) {
      if (editingItem.type === "header") {
        updateItem(editingItem.id, {
          title: newHeaderTitle.trim() || "Section",
          iconPath: newHeaderIconPath,
        });
      } else {
        const sizeToSave = availableSizes.includes(newSize)
          ? newSize
          : availableSizes[0];
        updateItem(editingItem.id, {
          title: newTitle.trim() || "Widget",
          kind: newKind,
          size: sizeToSave,
          entityId: trimmedEntity || undefined,
        });
      }
    } else {
      if (addMode === "header") {
        addHeader(newHeaderTitle.trim() || "Section", newHeaderIconPath);
      } else {
        const sizeToSave = availableSizes.includes(newSize)
          ? newSize
          : availableSizes[0];
        addTile({
          title: newTitle.trim() || "Widget",
          kind: newKind,
          size: sizeToSave,
          entityId: trimmedEntity || undefined,
        });
      }
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={() => setEntityPickerOpen(false)}
      >
        {/*
          White block that sits behind the sheet and fills the safe-area gap
          at the very bottom (behind iPhone home indicator). It's positioned
          outside the rounded/clipped container so overflow-hidden never clips it.
        */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: insets.bottom + 32, // 32 covers the rounded corner overlap
            backgroundColor: "white",
          }}
          pointerEvents="none"
        />

        <AvoidSoftInputView style={{ width: "100%" }}>
          <Pressable
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              overflow: "hidden",
              maxHeight: "90%",
              width: "100%",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
                paddingBottom: insets.bottom + 24,
              }}
            >
              {/* Header row */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-black text-lg font-bold">
                  {editingItem ? "Edit" : "Add"}
                </Text>
                <Pressable onPress={onClose} hitSlop={12}>
                  <Text className="text-black font-semibold">Close</Text>
                </Pressable>
              </View>

              {/* Mode toggle (add only) */}
              {!editingItem && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">What do you want to add?</Text>
                  <View className="flex-row" style={{ gap: 8 }}>
                    {(["tile", "header"] as AddMode[]).map((m) => (
                      <PillButton
                        key={m}
                        label={m === "tile" ? "Widget" : "Header"}
                        active={addMode === m}
                        onPress={() => {
                          setAddMode(m);
                          setEntityPickerOpen(false);
                        }}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* ── Header form ── */}
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
                  <View className="flex-row items-center" style={{ gap: 10 }}>
                    <Pressable
                      onPress={() => {
                        setEntityPickerOpen(false);
                        setIconPickerOpen(true);
                      }}
                      className="px-4 py-3 rounded-2xl bg-gray-100"
                    >
                      <Text className="text-black font-semibold">
                        {newHeaderIconPath ? "Change icon" : "Choose icon"}
                      </Text>
                    </Pressable>

                    {newHeaderIconPath ? (
                      <View className="flex-row items-center" style={{ gap: 10 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: "#E5E7EB",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MdiIcon path={newHeaderIconPath} size={22} color="#111827" />
                        </View>
                        <Pressable
                          onPress={() => setNewHeaderIconPath(undefined)}
                          className="px-3 py-2 rounded-2xl bg-red-50"
                        >
                          <Text className="text-red-600 font-semibold">Clear</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Text className="text-gray-500 text-sm">No icon selected</Text>
                    )}
                  </View>
                </>
              )}

              {/* ── Tile form ── */}
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
                    {kindOptions.map((k) => (
                      <PillButton
                        key={k}
                        label={k}
                        active={newKind === k}
                        onPress={() => {
                          setNewKind(k);
                          setNewEntityId("");
                          setEntityQuery("");
                          setEntityPickerOpen(false);
                        }}
                      />
                    ))}
                  </View>

                  <Text className="text-gray-600 mt-4 mb-2">Size</Text>
                  <View className="flex-row" style={{ gap: 8 }}>
                    {sizeOptions.map((s) => (
                      <PillButton
                        key={s}
                        label={s}
                        active={newSize === s}
                        disabled={!availableSizes.includes(s)}
                        onPress={() => {
                          if (!availableSizes.includes(s)) return;
                          setNewSize(s);
                        }}
                      />
                    ))}
                  </View>

                  <Text className="text-gray-600 mt-4 mb-2">
                    {newKind === "ai" ? "Room" : "Entity ID"}
                  </Text>
                  <TextInput
                    value={entityQuery}
                    onChangeText={(t) => {
                      setEntityQuery(t);
                      setNewEntityId(t);
                      setEntityPickerOpen(true);
                    }}
                    onFocus={() => setEntityPickerOpen(true)}
                    placeholder={
                      newKind === "ai"
                        ? roomsLoading
                          ? "Loading rooms..."
                          : "Choose a room"
                        : devicesLoading
                        ? "Loading devices…"
                        : `e.g. ${newKind}.kitchen`
                    }
                    placeholderTextColor="#9CA3AF"
                    className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {entityPickerOpen && newKind === "ai" && roomSuggestions.length > 0 && (
                    <View
                      className="mt-2 border border-gray-200 rounded-2xl overflow-hidden"
                      style={{ maxHeight: 200 }}
                    >
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        {roomSuggestions.map((r, i) => (
                          <Pressable
                            key={r.id}
                            onPress={() => {
                              setNewEntityId(r.name);
                              setEntityQuery(r.name);
                              setEntityPickerOpen(false);
                            }}
                            className={`px-4 py-3 bg-white ${
                              i < roomSuggestions.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                          >
                            <Text className="text-black font-semibold">{r.name}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {entityPickerOpen && newKind !== "ai" && entitySuggestions.length > 0 && (
                    <View
                      className="mt-2 border border-gray-200 rounded-2xl overflow-hidden"
                      style={{ maxHeight: 200 }}
                    >
                      <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        {entitySuggestions.map((d, i) => (
                          <Pressable
                            key={d.entity_id}
                            onPress={() => {
                              setNewEntityId(d.entity_id);
                              setEntityQuery(d.entity_id);
                              setEntityPickerOpen(false);
                            }}
                            className={`px-4 py-3 bg-white ${
                              i < entitySuggestions.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                          >
                            <Text className="text-black font-semibold">{d.name}</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">
                              {d.entity_id}
                              {d.area ? ` • ${d.area}` : ""}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {entityPickerOpen &&
                    newKind !== "ai" &&
                    entityQuery.length > 0 &&
                    entitySuggestions.length === 0 && (
                    <Text className="text-gray-500 text-xs mt-2">
                      No matching {newKind} devices found.
                    </Text>
                  )}

                  {entityPickerOpen &&
                    newKind === "ai" &&
                    entityQuery.length > 0 &&
                    roomSuggestions.length === 0 && (
                    <Text className="text-gray-500 text-xs mt-2">
                      No matching rooms found.
                    </Text>
                  )}

                </>
              )}

              {/* Actions */}
              <View className="flex-row justify-end mt-5" style={{ gap: 10 }}>
                <Pressable onPress={onClose} className="px-4 py-3 rounded-2xl bg-gray-100">
                  <Text className="text-black font-semibold">Cancel</Text>
                </Pressable>
                <Pressable onPress={onSave} className="px-4 py-3 rounded-2xl bg-black">
                  <Text className="text-white font-semibold">{editingItem ? "Save" : "Add"}</Text>
                </Pressable>
              </View>

              <Text className="text-gray-500 text-xs mt-3">Drag headers and widgets to reorder.</Text>
            </ScrollView>
          </Pressable>
        </AvoidSoftInputView>
      </Pressable>

      <IconPickerModal
        visible={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedPath={newHeaderIconPath}
        onSelect={(path) => {
          setNewHeaderIconPath(path);
          setIconPickerOpen(false);
        }}
      />
    </Modal>
  );
}
