import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {Text, Pressable, View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mdiPencil } from "@mdi/js";

import {AvailableCamera, getAvailableCameras, getTrackedCameras, addTrackedCamera, removeTrackedCamera} from "@/lib/api/deviceControllers/camera";
import { getRooms } from "@/lib/api/ai/rooms";

import GradientButton from "@/components/GradientButton";
import AddCameraModal from "@/components/AddCameraModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import MdiIcon from "@/components/MdiIcon";
import SectionCard from "@/components/aiAndAutomation/SectionCard";
import Row from "@/components/aiAndAutomation/Row";

type Camera = {
  id: string;
  name: string;
  locationHint?: string | null;
};

type Room = {
  id: number;
  name: string;
};

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

function ChipButton({
  title,
  variant = "outline",
  onPress,
  disabled,
}: {
  title: string;
  variant?: "outline" | "danger";
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
      <Pressable
          onPress={onPress}
          disabled={disabled}
          className="px-3 py-2 rounded-2xl items-center justify-center"
          style={({ pressed }) => ({
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: variant === "danger" ? "#FCA5A5" : "#D1D5DB",
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          })}
          hitSlop={10}
      >
        <Text
            style={{
              color: variant === "danger" ? "#EF4444" : "#111827",
              fontWeight: "600",
              fontSize: 13,
            }}
        >
          {title}
        </Text>
      </Pressable>
  );
}

//State with no rooms defined
function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
      <View className="px-4 py-4">
        <Text className="text-subtext text-black font-semibold">{title}</Text>
        <Text className="mt-2 text-hint text-textSecondary">{body}</Text>
        {cta ? <View className="mt-3">{cta}</View> : null}
      </View>
  );
}

// Main screen
export default function AiAutomationPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [trackedCams, setTrackedCams] = useState<Camera[]>([]);
  const [availableCameras, setAvailableCameras] = useState<AvailableCamera[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [addCamOpen, setAddCamOpen] = useState(false);
  const [removingCamId, setRemovingCamId] = useState<string | null>(null);

  const [dialog, setDialog] = useState<DialogState>(DIALOG_HIDDEN);

  const showError = (message: string) => {
    setDialog({
      visible: true,
      title: "Something went wrong",
      message,
      error: true,
      confirmText: "OK",
      onConfirm: () => setDialog(DIALOG_HIDDEN),
    });
  };

  const hideDialog = () => setDialog(DIALOG_HIDDEN);

  // Loads rooms and cameras
  const loadAll = useCallback(async () => {
    const [available, trackedIds, roomList] = await Promise.all([
      getAvailableCameras(),
      getTrackedCameras(),
      getRooms(),
    ]);

    const trackedSet = new Set(trackedIds);

    setAvailableCameras(available);

    setTrackedCams(
      available
        .filter((c) => trackedSet.has(c.id))
        .map((c) => ({ id: c.id, name: c.name, locationHint: c.area ?? null }))
    );

    setRooms(roomList.map((r) => ({ id: r.id, name: r.name })));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);

      (async () => {
        try {
          await loadAll();
        } catch (e: any) {
          if (mounted) showError(e?.message ?? "Failed to load settings.");
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      return () => { mounted = false; };
    }, [loadAll])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } catch (e: any) {
      showError(e?.message ?? "Failed to refresh.");
    } finally {
      setRefreshing(false);
    }
  }, [loadAll]);

  const trackedIds = useMemo(() => trackedCams.map((c) => c.id), [trackedCams]);

  //Remove camera funciton
  const handleRemoveCamera = (cam: Camera) => {
    setDialog({
      visible: true,
      title: "Remove camera",
      message: `Stop analysing "${cam.name}"?`,
      destructive: true,
      confirmText: "Remove",
      cancelText: "Cancel",
      onConfirm: () => {
        hideDialog();
        (async () => {
          try {
            setRemovingCamId(cam.id);
            await removeTrackedCamera(cam.id);
            setTrackedCams((prev) => prev.filter((c) => c.id !== cam.id));
          } catch (e: any) {
            showError(e?.message ?? "Failed to remove camera.");
          } finally {
            setRemovingCamId(null);
          }
        })();
      },
    });
  };

  // Add camera function
  const handleAddCamera = async (cam: AvailableCamera) => {
    try {
      await addTrackedCamera(cam.id);
      setTrackedCams((prev) =>
        prev.some((c) => c.id === cam.id)
          ? prev
          : [...prev, { id: cam.id, name: cam.name, locationHint: cam.area ?? null }]
      );
    } catch (e: any) {
      showError(e?.message ?? "Failed to add camera.");
      throw e;
    }
  };

  // Rendering page
  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
          <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>AI & Automation</Text>
          </View>

          <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

          {loading ? (
              <View className="pt-10 items-center">
                <ActivityIndicator />
                <Text className="mt-3 text-textSecondary">Loading settings…</Text>
              </View>
          ) : (
              <>
                {/* Camera detection */}
                <SectionCard title="Camera detection">
                  {trackedCams.length === 0 ? (
                      <EmptyState
                          title="No cameras added"
                          body="Add a camera to enable face recognition and person detection."
                          cta={
                        <GradientButton
                            title="Add camera"
                            onPress={() => setAddCamOpen(true)}
                        />
                      }
                      />
                  ) : (
                      <>
                        <View className="px-4 pt-4">
                          <Text className="text-hint text-textSecondary">
                            These cameras are currently being analysed by Neura Home.
                          </Text>
                        </View>

                        <View className="mt-2">
                          {trackedCams.map((cam, idx) => (
                              <Row
                                  key={cam.id}
                                  title={cam.name}
                                  subtitle={cam.locationHint ?? "Camera"}
                                  isLast={idx === trackedCams.length - 1}
                                  right={
                                removingCamId === cam.id ? (
                                    <ActivityIndicator />
                                ) : (
                                    <ChipButton
                                        title="Remove"
                                        variant="danger"
                                        onPress={() => handleRemoveCamera(cam)}
                                    />
                                )
                              }
                                  // TODO: Figure out the function of this
                                  onPress={() => router.push(`/(drawer)/ai/cameras/${cam.id}`)}
                              />
                          ))}
                        </View>
                        <View className="px-4 py-4">
                          <GradientButton
                              title="Add camera"
                              onPress={() => setAddCamOpen(true)}
                          />
                          <Text className="mt-3 text-hint text-textSecondary">
                            Tip: For best results, use a stable stream and keep the camera angle consistent.
                          </Text>
                        </View>
                      </>
                  )}
                </SectionCard>

                {/* Rooms */}
                <SectionCard title="Rooms & behaviour">
                  {rooms.length === 0 ? (
                      <EmptyState
                          title="No rooms yet"
                          body="Create rooms so you can enable AI per room and tune how it behaves."
                          cta={
                        <GradientButton
                            title="Create room"
                            onPress={() => router.push({pathname: "/settings/aiAndAutomation/createRoom", params: {}})}
                        />
                      }
                      />
                  ) : (
                      <>
                        <View className="px-4 pt-4">
                          <Text className="text-hint text-textSecondary">
                            Enable AI per room. You can fine-tune room settings inside each room.
                          </Text>
                        </View>

                        <View className="mt-2">
                          {rooms.map((room, idx) => (
                              <Row
                                  key={room.id}
                                  title={room.name}
                                  subtitle="Configure room"
                                  isLast={idx === rooms.length - 1}
                                  right ={
                                <MdiIcon path={mdiPencil} size={22} color="#9CA3AF"/>
                              }
                                  onPress={() =>
                                      router.push({
                                        pathname: "/settings/aiAndAutomation/createRoom",
                                        params: { id: room.id },
                                      })
                              }
                              />
                          ))}
                        </View>
                        <View className="px-4 py-4">
                          <GradientButton
                              title="Create room"
                              onPress={() => router.push("/settings/aiAndAutomation/createRoom")}
                          />
                          <Text className="mt-3 text-hint text-textSecondary">
                            Example: "Bedroom" can be more conservative, while "Living room" can be more proactive.
                          </Text>
                        </View>
                      </>
                  )}
                </SectionCard>

                {/* Safety context */}
                <SectionCard title="Safety">
                  <View className="px-4 py-4">
                    <Text className="text-hint text-textSecondary">
                      AI actions will only trigger when occupancy/motion is detected in that room, based
                      on your current system rules.
                    </Text>

                    <View className="mt-3">
                      <Pressable
                          // TODO: Change this link
                          onPress={() => router.push("/(drawer)/ai/about")}
                          hitSlop={10}
                          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                      >
                        <Text style={{ color: "#111827", fontWeight: "600" }}>
                          Learn how AI works
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </SectionCard>
              </>
          )}
        </ScrollView>

        <AddCameraModal
            visible={addCamOpen}
            onClose={() => setAddCamOpen(false)}
            available={availableCameras}
            enabledIds={trackedIds}
            onAdd={handleAddCamera}
        />

        <ConfirmDialog
            visible={dialog.visible}
            title={dialog.title}
            message={dialog.message}
            error={dialog.error}
            destructive={dialog.destructive}
            confirmText={dialog.confirmText}
            cancelText={dialog.cancelText}
            onConfirm={dialog.onConfirm ?? hideDialog}
            onCancel={hideDialog}
        />
      </SafeAreaView>
  );
}