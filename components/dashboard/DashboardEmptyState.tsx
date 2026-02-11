import React from "react";
import { View, Text, Pressable } from "react-native";
import MdiIcon from "@/components/MdiIcon";
import { mdiPencil } from "@mdi/js";

type Props = {
  onPressEdit: () => void;
  title?: string;
  subtitle?: string;
  ctaText?: string;
};

export default function DashboardEmptyState({
  onPressEdit,
  title = "It’s looking a little empty in here…",
  subtitle = "Add a few widgets and make this dashboard feel like home.",
  ctaText = "Customize dashboard",
}: Props) {
  return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-[420px] border border-gray-200 rounded-3xl p-5 bg-white">
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View className="flex-1">
              <Text className="text-black font-bold text-base">{title}</Text>
              <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
            </View>
          </View>
          <Pressable
              onPress={onPressEdit}
              className="mt-4 bg-black rounded-2xl px-4 py-3 flex-row items-center justify-center"
              style={{ gap: 8 }}
          >
            <MdiIcon path={mdiPencil} size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold">{ctaText}</Text>
          </Pressable>
        </View>
      </View>
  );}
