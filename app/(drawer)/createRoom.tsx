import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

import {
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  type RoomDto,
} from "@/lib/api/ai/rooms";
import { listDevices, type ApiDevice } from "@/lib/api/devices";
import ConfirmDialog from "@/components/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type SaveStatus = "idle" | "saving" | "saved" | "error";

type DialogState = {
  visible: boolean;
  title: string;
  message?: string;
  error?: boolean;
  destructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

const DIALOG_HIDDEN: DialogState = { visible: false, title: "" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<ApiDevice["kind"], string> = {
  light: "Lights",
  fan: "Fans",
  switch: "Switches",
  cover: "Covers",
  climate: "Climate",
  media_player: "Media",
  camera: "Cameras",
  sensor: "Sensors",
  binary_sensor: "Sensors",
};

function grouped(devices: ApiDevice[]): [string, ApiDevice[]][] {
  const map = new Map<string, ApiDevice[]>();
  for (const d of devices) {
    const label = KIND_LABEL[d.kind] ?? d.kind;
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(d);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status, error }: { status: SaveStatus; error?: string | null }) {
  if (status === "idle") return null;
  const config = {
    saving: { bg: "#F3F4F6", text: "#6B7280", label: "Saving…" },
    saved:  { bg: "#DCFCE7", text: "#15803D", label: "Saved"   },
    error:  { bg: "#FEE2E2", text: "#DC2626", label: "Error" },
  }[status];
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: config.bg }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: config.text }}>{config.label}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="px-6 pt-4">
      <Text className="text-primaryTo text-h3 font-bold">{title}</Text>
      <View className="mt-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {children}
      </View>
    </View>
  );
}

function DeviceRow({
  device,
  isAdded,
  isLast,
  onToggle,
}: {
  device: ApiDevice;
  isAdded: boolean;
  isLast: boolean;
  onToggle: () => void;
}) {
  return (
    <View className={`px-4 py-3 flex-row items-center justify-between ${!isLast ? "border-b border-gray-200" : ""}`}>
      <View className="flex-1 pr-3">
        <Text className="text-subtext text-black" numberOfLines={1}>{device.name}</Text>
        {!!device.area && (
          <Text className="text-hint text-textSecondary mt-0.5" numberOfLines={1}>{device.area}</Text>
        )}
      </View>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        className="px-3 py-2 rounded-2xl items-center justify-center"
        style={({ pressed }) => ({
          backgroundColor: isAdded ? "#FFF1F2" : "white",
          borderWidth: 1,
          borderColor: isAdded ? "#FCA5A5" : "#D1D5DB",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 13, fontWeight: "600", color: isAdded ? "#EF4444" : "#111827" }}>
          {isAdded ? "Remove" : "Add"}
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CreateRoomScreen() {
  // If `id` param is present we're in edit mode
  const { id } = useLocalSearchParams<{ id?: string }>();
  const roomId = id ? Number(id) : null;
  const isEditMode = roomId !== null;

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [existingRoom, setExistingRoom] = useState<RoomDto | null>(null);
  const [allDevices, setAllDevices] = useState<ApiDevice[]>([]);
  const [loading, setLoading] = useState(isEditMode); // only show loader in edit mode

  // ── Form state ────────────────────────────────────────────────────────────────
  const [roomName, setRoomName] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  // ── Edit mode toggle (only relevant when editing) ─────────────────────────────
  // In create mode the form is always "open". In edit mode it starts read-only.
  const [isEditing, setIsEditing] = useState(!isEditMode);
  const [devicesLoading, setDevicesLoading] = useState(false);

  // ── Status ───────────────────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(DIALOG_HIDDEN);

  const nameInputRef = useRef<TextInput>(null);

  // ── Load ─────────────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const currentId = id && id !== "" ? Number(id) : null;
      const currentlyEditMode = currentId !== null && !isNaN(currentId);

      // Always reset form state on focus
      setRoomName("");
      setSelectedIds(new Set());
      setQuery("");
      setSaveStatus("idle");
      setSaveError(null);
      setAllDevices([]);
      setIsEditing(!currentlyEditMode);
      setExistingRoom(null);

      if (currentlyEditMode) {
        setLoading(true);
        Promise.all([getRoom(currentId!), listDevices()])
          .then(([room, devices]) => {
            setExistingRoom(room);
            setRoomName(room.name);
            setSelectedIds(new Set(room.entity_ids));
            setAllDevices(devices); // ← devices available from the start
          })
          .catch((e) => {
            setDialog({
              visible: true,
              title: "Failed to load room",
              message: e?.message ?? "Please go back and try again.",
              error: true,
              confirmText: "Go back",
              onConfirm: () => router.push("/(drawer)/aiAndAutomation"),
            });
          })
          .finally(() => setLoading(false));
      } else{
        setLoading(false);
        listDevices()
          .then((devices) => setAllDevices(devices))
          .catch(() => {});
      }
    }, [id]) // ← depends on `id` directly, not `isEditMode`
  );
  // ── Derived ──────────────────────────────────────────────────────────────────

  const filteredDevices = query.trim()
    ? allDevices.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.entity_id.toLowerCase().includes(query.toLowerCase()) ||
          (d.area ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : allDevices;

  const groupedDevices = grouped(filteredDevices);
  const selectedDevices = allDevices.filter((d) => selectedIds.has(d.entity_id));

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const toggleDevice = useCallback((entityId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(entityId) ? next.delete(entityId) : next.add(entityId);
      return next;
    });
  }, []);

  const handleSave = async () => {
    const trimmed = roomName.trim();
    if (!trimmed) {
      nameInputRef.current?.focus();
      return;
    }
    Keyboard.dismiss();
    setSaveStatus("saving");
    setSaveError(null);

    try {
      if (isEditMode) {
        const updated = await updateRoom(roomId!, trimmed, Array.from(selectedIds));
        setExistingRoom(updated);
        setRoomName(updated.name);
        setSelectedIds(new Set(updated.entity_ids));
        setSaveStatus("saved");
        setIsEditing(false);
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        await createRoom(trimmed, Array.from(selectedIds));
        setSaveStatus("saved");
        setTimeout(() => router.back(), 800);
      }
    } catch (e: any) {
      const detail = e?.detail ?? e?.message ?? "Failed to save.";
      let errorMsg: string;

      if (typeof detail === "string" && detail.includes("Entity IDs already in another room")) {
        const conflicting = allDevices
            .filter((d) => detail.includes(d.entity_id))
            .map((d) => d.name);
        errorMsg = conflicting.length > 0
            ? `Already in another room: ${conflicting.join(", ")}`
            : "Some devices are already in another room.";
      } else {
        errorMsg = typeof detail === "string" ? detail : "Failed to save.";
      }

      setSaveError(errorMsg);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }

  const handleCancel = () => {
    if (isEditMode && isEditing) {
      // Revert to last saved state
      if (existingRoom) {
        setRoomName(existingRoom.name);
        setSelectedIds(new Set(existingRoom.entity_ids));
      }
      setQuery("");
      setIsEditing(false);
      Keyboard.dismiss();
    } else {
      router.push("/(drawer)/aiAndAutomation");
    }
  };

  const handleDeletePress = () => {
    setDialog({
      visible: true,
      title: "Delete room",
      message: `Are you sure you want to delete "${existingRoom?.name}"? This cannot be undone.`,
      destructive: true,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        setDialog(DIALOG_HIDDEN);
        (async () => {
          try {
            await deleteRoom(roomId!);
            router.push('/(drawer)/aiAndAutomation')
          } catch (e: any) {
            setDialog({
              visible: true,
              title: "Something went wrong",
              message: e?.message ?? "Failed to delete room.",
              error: true,
              confirmText: "OK",
              onConfirm: () => setDialog(DIALOG_HIDDEN),
            });
          }
        })();
      },
    });
  };

  // ── Loading state (edit mode only) ───────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>Loading room…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const screenTitle = isEditMode
    ? (existingRoom?.name ?? "Room")
    : "New Room";

  const leftLabel = isEditing && isEditMode ? "Cancel" : isEditMode ? "Back" : "Cancel";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* ── Header ── */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}>
          <Pressable onPress={handleCancel} hitSlop={12}>
            <Text style={{ fontWeight: "600", color: "#111827" }}>{leftLabel}</Text>
          </Pressable>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>
              {screenTitle}
            </Text>
            <StatusPill status={saveStatus} error={saveError} />
          </View>

          {/* Right: Save (when editing/creating) or Edit (when viewing) */}
          {isEditing ? (
            <Pressable onPress={handleSave} disabled={saveStatus === "saving"} hitSlop={12}>
              <Text style={{ fontWeight: "700", color: saveStatus === "saving" ? "#9CA3AF" : "#111827" }}>
                Save
              </Text>
            </Pressable>
          ) : devicesLoading? (
              <ActivityIndicator size="small" />
          ) : (
            <Pressable onPress={async () => {
              setDevicesLoading(true);
              try {
                const devices = await listDevices();
                setAllDevices(devices);
              } catch {
                // non-fatal
              } finally {
                setDevicesLoading(false);
              }
              setIsEditing(true);
            }}

            >
              <Text style={{ fontWeight: "600", color: "#111827" }}>Edit</Text>
            </Pressable>
          )}
        </View>

        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        {saveStatus === "error" && saveError && (
            <View style={{
              backgroundColor: "#FEF2F2",
              borderBottomWidth: 1,
              borderBottomColor: "#FECACA",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
              <Text style={{ color: "#DC2626", fontSize: 13, fontWeight: "500" }}>
                {saveError}
              </Text>
            </View>
        )}


        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Room name ── */}
          <SectionCard title="Room name">
            <View className="px-4 py-4">
              <TextInput
                ref={nameInputRef}
                value={roomName}
                onChangeText={setRoomName}
                editable={isEditing}
                placeholder="e.g. Living Room"
                placeholderTextColor="#9CA3AF"
                autoFocus={!isEditMode}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: isEditing ? "#111827" : "#374151",
                }}
              />
            </View>
          </SectionCard>

          {/* ── Devices in room ── */}
          <SectionCard title={`Devices in room (${selectedDevices.length})`}>
            {selectedDevices.length === 0 ? (
              <View className="px-4 py-4">
                <Text className="text-hint text-textSecondary">
                  {isEditing
                    ? "Search below to add devices."
                    : "No devices added. Tap Edit to add some."}
                </Text>
              </View>
            ) : (
              selectedDevices.map((d, idx) => (
                <View
                  key={d.entity_id}
                  className={`px-4 py-3 flex-row items-center justify-between ${idx < selectedDevices.length - 1 ? "border-b border-gray-200" : ""}`}
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-subtext text-black" numberOfLines={1}>{d.name}</Text>
                    {!!d.area && (
                      <Text className="text-hint text-textSecondary mt-0.5" numberOfLines={1}>
                        {d.area} · {KIND_LABEL[d.kind] ?? d.kind}
                      </Text>
                    )}
                  </View>
                  {isEditing && (
                    <Pressable
                      onPress={() => toggleDevice(d.entity_id)}
                      hitSlop={10}
                      className="px-3 py-2 rounded-2xl"
                      style={({ pressed }) => ({
                        backgroundColor: "#FFF1F2",
                        borderWidth: 1,
                        borderColor: "#FCA5A5",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#EF4444" }}>Remove</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </SectionCard>

          {/* ── Device picker — shown when editing or creating ── */}
          {isEditing && (
            <>
              <View className="px-6 pt-4">
                <Text className="text-primaryTo text-h3 font-bold">Add devices</Text>
                <View
                  className="mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4"
                  style={{ height: 44 }}
                >
                  <Text style={{ fontSize: 16, color: "#9CA3AF", marginRight: 8 }}>⌕</Text>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search by name or area…"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ flex: 1, fontSize: 15, color: "#111827" }}
                  />
                  {query.length > 0 && (
                    <Pressable onPress={() => setQuery("")} hitSlop={10}>
                      <Text style={{ fontSize: 15, color: "#9CA3AF", fontWeight: "600" }}>✕</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {allDevices.length === 0 ? (
                <View className="px-6 pt-4">
                  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                    <Text className="text-subtext text-black font-semibold">No devices found</Text>
                    <Text className="mt-1 text-hint text-textSecondary">
                      Make sure your home controller is connected.
                    </Text>
                  </View>
                </View>
              ) : filteredDevices.length === 0 ? (
                <View className="px-6 pt-4">
                  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
                    <Text className="text-hint text-textSecondary">No devices match "{query}".</Text>
                  </View>
                </View>
              ) : (
                groupedDevices.map(([label, devices]) => (
                  <View key={label} className="px-6 pt-4">
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      marginBottom: 8,
                    }}>
                      {label}
                    </Text>
                    <View className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      {devices.map((device, idx) => (
                        <DeviceRow
                          key={device.entity_id}
                          device={device}
                          isAdded={selectedIds.has(device.entity_id)}
                          isLast={idx === devices.length - 1}
                          onToggle={() => toggleDevice(device.entity_id)}
                        />
                      ))}
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* ── Delete — only in edit mode ── */}
          {isEditMode && (
            <View className="px-6 pt-6">
              <Pressable
                onPress={handleDeletePress}
                className="rounded-2xl border border-red-200 bg-white px-4 py-4 items-center"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ fontWeight: "600", color: "#EF4444" }}>Delete room</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.title}
        message={dialog.message}
        error={dialog.error}
        destructive={dialog.destructive}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm ?? (() => setDialog(DIALOG_HIDDEN))}
        onCancel={() => setDialog(DIALOG_HIDDEN)}
      />
    </SafeAreaView>
  );
}