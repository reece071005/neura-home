import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  InteractionManager,
  Alert,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { mdiPencil } from "@mdi/js";

import { useDashboardStateSync } from "@/lib/hooks/useDashboardStateSync";

import {
  useDashboardWidgetsStore,
  type DashboardItem,
  type TileKind,
  type WidgetSize,
} from "@/lib/storage/dashboardWidgetStore";

import {
  AddMode,
  kindOptions,
  sizeOptions,
  TILEKIND_TO_DEVICEKINDS,
} from "@/lib/editDashboard/dashboardTypes";

import { useDeviceAutocomplete } from "@/lib/editDashboard/useDeviceAutocomplete";

import SyncPill from "@/components/editDashboard/SyncPill";
import IconPickerModal from "@/components/editDashboard/IconPickerModal";
import MdiIcon from "@/components/MdiIcon";


export default function EditDashboard() {
  // ----- store -----
  const items = useDashboardWidgetsStore((s) => s.items);
  const setItems = useDashboardWidgetsStore((s) => s.setItems);
  const removeItem = useDashboardWidgetsStore((s) => s.removeItem);
  const updateItem = useDashboardWidgetsStore((s) => s.updateItem);
  const addHeader = useDashboardWidgetsStore((s) => s.addHeader);
  const addTile = useDashboardWidgetsStore((s) => s.addTile);

  const dashboards = useDashboardWidgetsStore((s) => s.dashboards);
  const activeDashboardId = useDashboardWidgetsStore((s) => s.activeDashboardId);
  const setActiveDashboard = useDashboardWidgetsStore((s) => s.setActiveDashboard);
  const addDashboard = useDashboardWidgetsStore((s) => s.addDashboard);
  const renameDashboard = useDashboardWidgetsStore((s) => s.renameDashboard);
  const setDashboardIcon = useDashboardWidgetsStore((s) => s.setDashboardIcon);
  const removeDashboard = useDashboardWidgetsStore((s) => s.removeDashboard);

  // ----- sync pill -----
  const { status, error } = useDashboardStateSync({ debounceMs: 800 });

  // ----- state: widget add/edit modal -----
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null);
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

  // Header icon picker (for header items)
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // ----- state: dashboard settings modal (rename + icon + delete) -----
  const [dashSettingsOpen, setDashSettingsOpen] = useState(false);
  const [dashNameDraft, setDashNameDraft] = useState("");
  const [dashIconDraft, setDashIconDraft] = useState<string | undefined>(undefined);
  const [dashIconPickerOpen, setDashIconPickerOpen] = useState(false);

  const activeDashboard = useMemo(
    () => dashboards.find((d) => d.id === activeDashboardId),
    [dashboards, activeDashboardId]
  );

  const { devicesLoading, suggestions: entitySuggestions } = useDeviceAutocomplete({
    kind: newKind,
    query: entityQuery,
  });

  // --------------------
  // Openers
  // --------------------
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

  const openDashboardSettings = () => {
    const current = activeDashboard;
    setDashNameDraft(current?.name ?? "");
    setDashIconDraft(current?.iconPath);
    setDashSettingsOpen(true);
  };

  // --------------------
  // Add / Save widget or header
  // --------------------
  const onAdd = () => {
    // Optional validation: if entity is set, ensure it matches selected kind
    const trimmedEntity = newEntityId.trim();
    if (addMode === "tile" && trimmedEntity) {
      const allowed = TILEKIND_TO_DEVICEKINDS[newKind];
      const matchesType =
        newKind === "generic" ||
        allowed.some((k) => trimmedEntity.startsWith(k + "."));

      if (!matchesType) {
        // (You can add inline error state later; for now, just do nothing)
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

  // --------------------
  // List item renderer
  // --------------------
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
              <Text className="text-black font-bold text-base">Header: {item.title}</Text>
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
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white pb-6">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-black font-semibold">Back</Text>
        </Pressable>

        <View className="items-center">
          <Pressable
            onPress={openDashboardSettings}
            hitSlop={12}
            className="items-center"
          >
          <View className="flex-row items-center" style={{ gap: 1 }}>
            {/* Dashboard icon (if any) */}
            {activeDashboard?.iconPath ? (
              <View
                style={{
                  width: 34,
                  height: 34,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdiIcon path={activeDashboard.iconPath} size={20} color="#111827" />
              </View>
            ) : null}

            {/* Dashboard name */}
            <Text className="text-textPrimary text-body font-bold">
              {activeDashboard?.name ?? "Dashboard"}
            </Text>

            {/* Pencil button */}
            <View pointerEvents="none" className="px-3">
              <MdiIcon path={mdiPencil} size={20} color="#000000"/>
            </View>
          </View>
          </Pressable>

      <SyncPill status={status} error={error} />
  </View>

        <Pressable onPress={openAdd} hitSlop={12}>
          <Text className="text-black font-semibold">Add</Text>
        </Pressable>
      </View>

      {/* Dashboard Picker */}
      <View className="px-4 mt-2 pb-2">
        <View className="flex-row items-center" style={{ gap: 8, flexWrap: "wrap" }}>
          {dashboards.map((d) => {
            const active = d.id === activeDashboardId;
            return (
              <Pressable
                key={d.id}
                onPress={() => setActiveDashboard(d.id)}
                className={`px-3 py-2 rounded-full border ${
                  active ? "bg-black border-black" : "bg-white border-gray-300"
                }`}
              >
                <Text className={active ? "text-white font-semibold" : "text-black font-semibold"}>
                  {d.name}
                </Text>
              </Pressable>
            );
          })}

          {dashboards.length < 3 && (
            <Pressable
              onPress={() => addDashboard("New dashboard")}
              className="px-3 py-2 rounded-full border bg-white border-gray-300"
            >
              <Text className="text-black font-semibold">+ Add</Text>
            </Pressable>
          )}

        </View>
      </View>

      {/* Draggable list */}
      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => {
          requestAnimationFrame(() => {
            InteractionManager.runAfterInteractions(() => {
              setItems(data);
            });
          });
        }}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 95,
          paddingTop: 16,
        }}
      />

      {/* Add/Edit Widget Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => {
            // tap outside closes dropdown only
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
                <Text className="text-gray-600 mt-4 mb-2">What do you want to add?</Text>
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
                          active ? "bg-black border-black" : "bg-white border-gray-300"
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

                  {/* Preview + clear */}
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
                          active ? "bg-black border-black" : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>{k}</Text>
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
                          active ? "bg-black border-black" : "bg-white border-gray-300"
                        }`}
                      >
                        <Text className={active ? "text-white" : "text-black"}>{s}</Text>
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

                {/* Empty state */}
                {entityPickerOpen && entityQuery.length > 0 && entitySuggestions.length === 0 && (
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

      {/* Dashboard Settings Modal (separate from widget modal) */}
      <Modal
        visible={dashSettingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDashSettingsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setDashSettingsOpen(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl p-4"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-lg font-bold">Dashboard settings</Text>
              <Pressable onPress={() => setDashSettingsOpen(false)} hitSlop={12}>
                <Text className="text-black font-semibold">Close</Text>
              </Pressable>
            </View>

            {/* Name */}
            <Text className="text-gray-600 mt-4 mb-2">Name</Text>
            <TextInput
              value={dashNameDraft}
              onChangeText={setDashNameDraft}
              placeholder="e.g. Upstairs"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
            />

            {/* Icon */}
            <Text className="text-gray-600 mt-4 mb-2">Icon</Text>
            <View className="flex-row items-center" style={{ gap: 10 }}>
              <Pressable
                onPress={() => setDashIconPickerOpen(true)}
                className="px-4 py-3 rounded-2xl bg-gray-100"
              >
                <Text className="text-black font-semibold">
                  {dashIconDraft ? "Change icon" : "Choose icon"}
                </Text>
              </Pressable>

              {dashIconDraft ? (
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
                    <MdiIcon path={dashIconDraft} size={22} color="#111827" />
                  </View>

                  <Pressable
                    onPress={() => setDashIconDraft(undefined)}
                    className="px-3 py-2 rounded-2xl bg-red-50"
                  >
                    <Text className="text-red-600 font-semibold">Clear</Text>
                  </Pressable>
                </View>
              ) : (
                <Text className="text-gray-500 text-sm">No icon selected</Text>
              )}
            </View>

            {/* Save/Cancel */}
            <View className="flex-row justify-end mt-5" style={{ gap: 10 }}>
              <Pressable
                onPress={() => {
                  // reset drafts back to current
                  setDashNameDraft(activeDashboard?.name ?? "");
                  setDashIconDraft(activeDashboard?.iconPath);
                  setDashSettingsOpen(false);
                }}
                className="px-4 py-3 rounded-2xl bg-gray-100"
              >
                <Text className="text-black font-semibold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  const nextName = dashNameDraft.trim();
                  if (nextName) renameDashboard(activeDashboardId, nextName);
                  setDashboardIcon(activeDashboardId, dashIconDraft);
                  setDashSettingsOpen(false);
                }}
                className="px-4 py-3 rounded-2xl bg-black"
              >
                <Text className="text-white font-semibold">Save</Text>
              </Pressable>
            </View>

            {/* Delete */}
            <View className="mt-5 pt-4 border-t border-gray-200">
              <Pressable
                disabled={dashboards.length <= 1}
                onPress={() => {
                  if (dashboards.length <= 1) return;

                  Alert.alert(
                    "Delete dashboard?",
                    "This cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          removeDashboard(activeDashboardId);
                          setDashSettingsOpen(false);
                        },
                      },
                    ]
                  );
                }}
                className={`px-4 py-3 rounded-2xl ${
                  dashboards.length <= 1 ? "bg-gray-100" : "bg-red-50"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    dashboards.length <= 1 ? "text-gray-400" : "text-red-600"
                  }`}
                >
                  Delete dashboard
                </Text>
                {dashboards.length <= 1 && (
                  <Text className="text-gray-400 text-xs mt-1">
                    You must keep at least one dashboard.
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Header Icon Picker (for header items) */}
      <IconPickerModal
        visible={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedPath={newHeaderIconPath}
        onSelect={(path) => {
          setNewHeaderIconPath(path);
          setIconPickerOpen(false);
        }}
      />

      {/* Dashboard Icon Picker (for dashboard itself) */}
      <IconPickerModal
        visible={dashIconPickerOpen}
        onClose={() => setDashIconPickerOpen(false)}
        selectedPath={dashIconDraft}
        onSelect={(path) => {
          setDashIconDraft(path);
          setDashIconPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}
