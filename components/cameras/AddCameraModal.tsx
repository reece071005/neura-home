// AddCameraModal.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { AvailableCamera } from "@/lib/api/devices";

type Props = {
  visible: boolean;
  onClose: () => void;
  available: AvailableCamera[];
  enabledIds: string[];
  loading?: boolean;
  onAdd: (camera: AvailableCamera) => Promise<void> | void;
  /** Whether to hide cameras that are already enabled. Defaults to true. */
  hideAlreadyEnabled?: boolean;
};

export default function AddCameraModal({
  visible,
  onClose,
  available,
  enabledIds,
  loading = false,
  onAdd,
  hideAlreadyEnabled = true,
}: Props) {
  const [query, setQuery] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const enabledSet = useMemo(() => new Set(enabledIds), [enabledIds]);

  const list = useMemo(() => {
    let items = hideAlreadyEnabled ? available.filter((c) => !enabledSet.has(c.id)) : available;

    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) =>
      `${c.name} ${c.area ?? ""} ${c.source ?? ""}`.toLowerCase().includes(q)
    );
  }, [available, query, enabledSet, hideAlreadyEnabled]);

  const handleAdd = async (cam: AvailableCamera) => {
    try {
      setAddingId(cam.id);
      await onAdd(cam);
      onClose();
    } catch (e: any) {
      // Let the parent handle errors via Alert if needed; just clear state here
      console.error("[AddCameraModal] onAdd error:", e);
    } finally {
      setAddingId(null);
    }
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable className="flex-1 justify-end bg-black/40" onPress={handleClose}>
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <Pressable className="bg-white rounded-t-3xl p-4" onPress={() => {}}>
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-black text-lg font-bold">Add camera</Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Text className="text-black font-semibold">Close</Text>
            </Pressable>
          </View>

          <Text className="text-gray-600 mt-2">
            Choose a camera to enable for computer vision.
          </Text>

          {/* Search */}
          <View className="mt-4">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search cameras…"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-2xl px-4 py-3 text-black"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* List */}
          <View className="mt-3 border border-gray-200 rounded-2xl overflow-hidden">
            {loading ? (
              <View className="px-4 py-5 items-center">
                <ActivityIndicator />
                <Text className="text-gray-500 text-xs mt-2">Loading cameras…</Text>
              </View>
            ) : list.length === 0 ? (
              <View className="px-4 py-5">
                <Text className="text-black font-semibold">No cameras found</Text>
                <Text className="text-gray-500 text-xs mt-1">
                  Try a different search, or connect a camera source.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 265 }} keyboardShouldPersistTaps="handled">
                {list.map((cam, idx) => {
                  const isLast = idx === list.length - 1;
                  const alreadyEnabled = enabledSet.has(cam.id);
                  const disabled = !hideAlreadyEnabled && alreadyEnabled;
                  const busy = addingId === cam.id;
                  const subtitle = [cam.area ?? "Camera", cam.source].filter(Boolean).join(" • ");

                  return (
                    <View
                      key={cam.id}
                      className={`px-4 py-4 ${!isLast ? "border-b border-gray-200" : ""}`}
                      style={{ opacity: disabled ? 0.5 : 1 }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                          <Text className="text-black font-semibold" numberOfLines={1}>
                            {cam.name}
                          </Text>
                          <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                            {subtitle}
                          </Text>
                        </View>

                        {busy ? (
                          <ActivityIndicator />
                        ) : (
                          <Pressable
                            disabled={disabled}
                            onPress={() => handleAdd(cam)}
                            className="px-3 py-2 rounded-2xl border border-gray-300 bg-white"
                            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                            hitSlop={10}
                          >
                            <Text className="text-black font-semibold text-sm">
                              {disabled ? "Added" : "Add"}
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <Text className="text-gray-500 text-xs mt-3">
            Only enabled cameras will be analysed. You can remove a camera later.
          </Text>
        </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}