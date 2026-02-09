// components/editDashboard/SyncPill.tsx
import React from "react";
import { View, Text } from "react-native";

type Props = {
  status: string;
  error: string | null;
};

export default function SyncPill({ status, error }: Props) {
  let text = "Saved";
  let bg = "bg-gray-100";
  let border = "border-gray-300";
  let color = "text-gray-700";

  if (status === "loading") {
    text = "Loading…";
  } else if (status === "saving") {
    text = "Saving…";
  } else if (status === "error") {
    text = "Error";
    bg = "bg-red-50";
    border = "border-red-300";
    color = "text-red-700";
  } else if (status === "saved") {
    text = "Saved";
    bg = "bg-green-50";
    border = "border-green-300";
    color = "text-green-700";
  }

  // keep prop for future (e.g., tooltip / inline message)
  void error;

  return (
    <View className="mt-1">
      <View className={`px-3 py-[2px] rounded-full border ${bg} ${border}`}>
        <Text className={`text-[11px] font-semibold ${color}`}>{text}</Text>
      </View>
    </View>
  );
}
