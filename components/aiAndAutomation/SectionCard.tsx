import React from "react";
import { View, Text } from "react-native";

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View className="px-6 pt-4">
      <Text className="text-primaryTo text-h3 font-bold">{title}</Text>

      <View className="mt-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {children}
      </View>
    </View>
  );
}