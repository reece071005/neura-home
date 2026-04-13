//SectionHeaderRow.tsx
import React from "react";
import { View, Text } from "react-native";

//Icons
import MdiIcon from "@/components/general/MdiIcon"; // your custom SVG wrapper

type Props = {
  title: string;
  iconPath: string;
};

export default function SectionHeader({ title, iconPath}: Props) {
  return (
    <View className="flex-row items-center px-1 ">
      <MdiIcon path={iconPath} size={24} color="#FFFFFF" />
      <Text className="ml-2 text-white font-semibold text-h2">{title}</Text>
    </View>
  );
}
