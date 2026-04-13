// components/editDashboard/EditDashboardEmptyState.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import MdiIcon from "@/components/general/MdiIcon";
import { mdiPlus, mdiViewDashboard } from "@mdi/js";

type Props = {
  onPressAdd: () => void;
};

export default function EditDashboardEmptyState({ onPressAdd }: Props) {
  return (
    <View className="flex-1 px-6 pt-8">
      <View className="w-full max-w-[420px] border border-gray-200 rounded-3xl p-5 bg-white">
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            className="bg-gray-100 rounded-2xl items-center justify-center"
            style={{ width: 48, height: 48 }}
          >
            <MdiIcon path={mdiViewDashboard} size={24} color="#6B7280" />
          </View>
          <View className="flex-1">
            <Text className="text-black font-bold text-base">
              Nothing here yet
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              Start building your dashboard with widgets and headers.
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onPressAdd}
          className="mt-4 bg-black rounded-2xl px-4 py-3 flex-row items-center justify-center"
          style={{ gap: 8 }}
        >
          <MdiIcon path={mdiPlus} size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold">Add your first widget</Text>
        </Pressable>
      </View>
    </View>
  );
}