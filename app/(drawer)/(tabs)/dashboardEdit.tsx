// dashboardEdit.tsx
import React, { useState } from "react";
import { View, Text, Pressable, InteractionManager } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";
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
import IconPickerModal from "@/components/editDashboard/IconPickerModal";
import AddEditModal from "@/components/editDashboard/AddEditModal";

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
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-black font-semibold">Back</Text>
        </Pressable>

        <View className="items-center">
          <Pressable onPress={openDashboardSettings} hitSlop={12} className="items-center">
            <View className="flex-row items-center" style={{ gap: 1 }}>
              {activeDashboard?.iconPath && (
                <View style={{ width: 34, height: 34, alignItems: "center", justifyContent: "center" }}>
                  <MdiIcon path={activeDashboard.iconPath} size={20} color="#111827" />
                </View>
              )}
              <Text className="text-textPrimary text-body font-bold">
                {activeDashboard?.name ?? "Dashboard"}
              </Text>
              <View pointerEvents="none" className="px-3">
                <MdiIcon path={mdiPencil} size={20} color="#000000" />
              </View>
            </View>
          </Pressable>
          <SyncPill status={status} error={error} />
        </View>

        <Pressable onPress={openAdd} hitSlop={12}>
          <Text className="text-black font-semibold">Add</Text>
        </Pressable>
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

      {/* Draggable list */}
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
        onPickIcon={() => setDashIconPickerOpen(true)}
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

      {/*
        Dashboard icon picker lives outside DashboardSettingsSheet.
        If that sheet is ever its own Modal, move this inside it too.
      */}
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
