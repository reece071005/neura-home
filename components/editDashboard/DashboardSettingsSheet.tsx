import React, { useMemo, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import MdiIcon from "@/components/general/MdiIcon";
import ConfirmDialog from "@/components/general/ConfirmDialog";
import IconPickerModal from "@/components/editDashboard/IconPickerModal";

type Props = {
    visible: boolean;
    onClose: () => void;

    dashNameDraft: string;
    setDashNameDraft: (v: string) => void;

    dashIconDraft?: string;
    iconPickerVisible: boolean;
    onOpenIconPicker: () => void;
    onCloseIconPicker: () => void;
    onSelectIcon: (iconPath: string) => void;
    onClearIcon: () => void;

    onCancel: () => void;
    onSave: () => void;

    cannotDelete: boolean;
    isPinnedDashboard: boolean;
    onConfirmDelete: () => void;
};

export default function DashboardSettingsSheet({
  visible,
  onClose,
  dashNameDraft,
  setDashNameDraft,
  dashIconDraft,
  iconPickerVisible,
  onOpenIconPicker,
  onCloseIconPicker,
  onSelectIcon,
  onClearIcon,
  onCancel,
  onSave,
  cannotDelete,
  isPinnedDashboard,
  onConfirmDelete,
}: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const deleteHelperText = useMemo(() => {
        if (isPinnedDashboard) return "Primary dashboard can’t be deleted.";
        return "This will permanently remove this dashboard.";
     }, [isPinnedDashboard]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => {
              if (iconPickerVisible) {
                onCloseIconPicker();
                return;
              }
              if (confirmOpen) return;
              onClose();
            }}
            >
                <Pressable className="bg-white rounded-t-3xl p-4" onPress={(e) => e.stopPropagation()}>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-black text-lg font-bold">Dashboard settings</Text>
                        <Pressable
                            onPress={() => {
                                if (iconPickerVisible) {
                                  onCloseIconPicker();
                                  return;
                                }
                                if (confirmOpen) return;
                                onClose();
                            }}
                            hitSlop={12}
                        >
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
                        <Pressable onPress={onOpenIconPicker} className="px-4 py-3 rounded-2xl bg-gray-100">
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

                                <Pressable onPress={onClearIcon} className="px-3 py-2 rounded-2xl bg-red-50">
                                    <Text className="text-red-600 font-semibold">Clear</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Text className="text-gray-500 text-sm">No icon selected</Text>
                        )}
                    </View>

                    {/* Save/Cancel */}
                    <View className="flex-row justify-end mt-5" style={{ gap: 10 }}>
                        <Pressable onPress={onCancel} className="px-4 py-3 rounded-2xl bg-gray-100">
                            <Text className="text-black font-semibold">Cancel</Text>
                        </Pressable>

                        <Pressable onPress={onSave} className="px-4 py-3 rounded-2xl bg-black">
                            <Text className="text-white font-semibold">Save</Text>
                        </Pressable>
                    </View>

                    {/* Delete */}
                    <View className="mt-5 pt-4 border-t border-gray-200">
                        <Pressable
                            disabled={cannotDelete}
                            onPress={() => {
                                if (cannotDelete) return;
                                setConfirmOpen(true);
                            }}
                            className={`px-4 py-3 rounded-2xl ${cannotDelete ? "bg-gray-100" : "bg-red-50"}`}
                        >
                            <Text className={`font-semibold ${cannotDelete ? "text-gray-400" : "text-red-600"}`}>
                                Delete dashboard
                            </Text>
                            <Text className="text-xs mt-1 text-gray-400">{deleteHelperText}</Text>
                        </Pressable>
                    </View>
                </Pressable>

                <ConfirmDialog
                    visible={confirmOpen}
                    title="Delete dashboard?"
                    message="This cannot be undone."
                    cancelText="Cancel"
                    confirmText="Delete"
                    destructive
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={() => {
                        onConfirmDelete();
                        setConfirmOpen(false);
                        onClose();
                    }}
                />

                <IconPickerModal
                  embedded
                  visible={iconPickerVisible}
                  onClose={onCloseIconPicker}
                  selectedPath={dashIconDraft}
                  onSelect={onSelectIcon}
                />
            </Pressable>
        </Modal>
    );
}
