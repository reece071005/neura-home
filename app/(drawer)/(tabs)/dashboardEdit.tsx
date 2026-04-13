// dashboardEdit.tsx
import React, { useCallback, useState } from "react";
import { View, Text, Pressable, InteractionManager } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { mdiPencil } from "@mdi/js";

import { useDashboardStateSync } from "@/lib/hooks/useDashboardStateSync";
import {
  useDashboardWidgetsStore,
  type DashboardItem,
} from "@/lib/storage/dashboardWidgetStore";

import { sizeOptions } from "@/lib/editDashboard/dashboardTypes";

import SyncPill from "@/components/editDashboard/SyncPill";
import MdiIcon from "@/components/MdiIcon";
import DashboardItemRow from "@/components/editDashboard/DashboardItemRow";
import DashboardSettingsSheet from "@/components/editDashboard/DashboardSettingsSheet";
import AddEditModal from "@/components/editDashboard/AddEditModal";
import EditDashboardEmptyState from "@/components/editDashboard/EditDashboardEmptyState";

// ─── Pill button ─────────────────────────────────────────────────────────────
function PillButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${
        active ? "bg-black border-black" : "bg-white border-gray-300"
      }`}
    >
      <Text className={active ? "text-white font-semibold" : "text-black font-semibold"}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function EditDashboard() {
  // Store
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

  const { status, error } = useDashboardStateSync({ debounceMs: 800 });

  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId);
  const isPinnedDashboard = activeDashboardId === dashboards[0]?.id;

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null);
  const [openAddSignal, setOpenAddSignal] = useState(0);

  // Dashboard settings state
  const [dashSettingsOpen, setDashSettingsOpen] = useState(false);
  const [dashNameDraft, setDashNameDraft] = useState("");
  const [dashIconDraft, setDashIconDraft] = useState<string | undefined>(undefined);
  const [dashIconPickerOpen, setDashIconPickerOpen] = useState(false);

  // Defensive cleanup: if this tab loses focus, close any overlays so they
  // cannot capture touches on other screens.
  useFocusEffect(
    useCallback(() => {
      return () => {
        setModalOpen(false);
        setDashSettingsOpen(false);
        setDashIconPickerOpen(false);
      };
    }, [])
  );

  // ── Helpers ──────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingItem(null);
    setOpenAddSignal((n) => n + 1);
    setModalOpen(true);
  };

  const openDashboardSettings = () => {
    setDashNameDraft(activeDashboard?.name ?? "");
    setDashIconDraft(activeDashboard?.iconPath);
    setDashSettingsOpen(true);
  };

  const openDashboardIconPicker = () => {
    setDashIconPickerOpen(true);
  };

  // ── Renderer ─────────────────────────────────────────────────────────────

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DashboardItem>) => (
    <DashboardItemRow
      item={item}
      drag={drag}
      isActive={isActive}
      sizeOptions={sizeOptions}
      onRemove={removeItem}
      onUpdate={updateItem}
      onEditHeader={(hdr) => {
        setEditingItem(hdr);
        setModalOpen(true);
      }}
      onEditTile={(tile) => {
        setEditingItem(tile);
        setModalOpen(true);
      }}
    />
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white pb-6">
      {/* Top bar */}
      <View className="px-4 pt-4 pb-3" style={{ minHeight: 74 }}>
        <View style={{ position: "absolute", left: 16, top: 18, zIndex: 2 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-black font-semibold">Back</Text>
          </Pressable>
        </View>

        <View style={{ position: "absolute", right: 16, top: 18, zIndex: 2 }}>
          <Pressable onPress={openAdd} hitSlop={12}>
            <Text className="text-black font-semibold">Add</Text>
          </Pressable>
        </View>

        <View className="items-center">
          <Pressable onPress={openDashboardSettings} hitSlop={12} className="items-center">
            <View className="flex-row items-center">
              <View style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center" }}>
                {activeDashboard?.iconPath ? (
                  <MdiIcon path={activeDashboard.iconPath} size={20} color="#111827" />
                ) : null}
              </View>
              <Text className="text-textPrimary text-body font-bold" style={{ marginHorizontal: 4 }}>
                {activeDashboard?.name ?? "Dashboard"}
              </Text>
              <View pointerEvents="none" style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center" }}>
                <MdiIcon path={mdiPencil} size={20} color="#000000" />
              </View>
            </View>
          </Pressable>
          <SyncPill status={status} error={error} />
        </View>
      </View>

      {/* Dashboard picker */}
      <View className="px-4 mt-2 pb-2">
        <View className="flex-row items-center flex-wrap" style={{ gap: 8 }}>
          {dashboards.map((d) => (
            <PillButton
              key={d.id}
              label={d.name}
              active={d.id === activeDashboardId}
              onPress={() => setActiveDashboard(d.id)}
            />
          ))}
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

      {/* Content: Empty state or Draggable list */}
      {items.length === 0 ? (
        <EditDashboardEmptyState onPressAdd={openAdd} />
      ) : (
        <DraggableFlatList
          data={items}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => {
            requestAnimationFrame(() => {
              InteractionManager.runAfterInteractions(() => setItems(data));
            });
          }}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 95, paddingTop: 16 }}
        />
      )}

      {/* Add / Edit Widget Modal */}
      <AddEditModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        addHeader={addHeader}
        addTile={addTile}
        updateItem={updateItem}
        openAddSignal={openAddSignal}
      />

      {/* Dashboard Settings Sheet */}
      <DashboardSettingsSheet
        visible={dashSettingsOpen}
        onClose={() => setDashSettingsOpen(false)}
        dashNameDraft={dashNameDraft}
        setDashNameDraft={setDashNameDraft}
        dashIconDraft={dashIconDraft}
        iconPickerVisible={dashIconPickerOpen}
        onOpenIconPicker={openDashboardIconPicker}
        onCloseIconPicker={() => setDashIconPickerOpen(false)}
        onSelectIcon={(path) => {
          setDashIconDraft(path);
          setDashIconPickerOpen(false);
        }}
        onClearIcon={() => setDashIconDraft(undefined)}
        onCancel={() => {
          setDashNameDraft(activeDashboard?.name ?? "");
          setDashIconDraft(activeDashboard?.iconPath);
          setDashSettingsOpen(false);
        }}
        onSave={() => {
          const nextName = dashNameDraft.trim();
          if (nextName) renameDashboard(activeDashboardId, nextName);
          setDashboardIcon(activeDashboardId, dashIconDraft);
          setDashSettingsOpen(false);
        }}
        cannotDelete={isPinnedDashboard}
        isPinnedDashboard={isPinnedDashboard}
        onConfirmDelete={() => removeDashboard(activeDashboardId)}
      />
    </SafeAreaView>
  );
}