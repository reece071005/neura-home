import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;

  destructive?: boolean;
  confirmDisabled?: boolean;

  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onCancel}>
        {/* Sheet */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl px-5 pt-5 pb-4"
        >
          <Text className="text-black text-lg font-bold">{title}</Text>

          {!!message && (
            <Text className="text-gray-600 text-sm mt-2 leading-5">{message}</Text>
          )}

          <View className="flex-row justify-end mt-5" style={{ gap: 10 }}>
            <Pressable
              onPress={onCancel}
              className="px-4 py-3 rounded-2xl bg-gray-100"
            >
              <Text className="text-black font-semibold">{cancelText}</Text>
            </Pressable>

            <Pressable
              disabled={confirmDisabled}
              onPress={onConfirm}
              className={`px-4 py-3 rounded-2xl ${
                confirmDisabled
                  ? "bg-gray-200"
                  : destructive
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            >
              <Text
                className={`font-semibold ${
                  confirmDisabled ? "text-gray-500" : "text-white"
                }`}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
