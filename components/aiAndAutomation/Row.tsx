import React from "react";
import { View, Text, Pressable } from "react-native";

type RowProps = {
  title: string;
  subtitle?: string | null;
  right?: React.ReactNode;
  isLast?: boolean;
  onPress?: () => void;
};

export default function Row({
  title,
  subtitle,
  right,
  isLast,
  onPress,
}: RowProps) {
  const content = (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-subtext text-black" numberOfLines={1}>
          {title}
        </Text>

        {!!subtitle && (
          <Text
            className="text-hint text-textSecondary mt-1"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {right}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`px-4 py-4 ${
          !isLast ? "border-b border-gray-200" : ""
        }`}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          backgroundColor: pressed ? "#F9FAFB" : "white",
        })}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className={`px-4 py-4 ${
        !isLast ? "border-b border-gray-200" : ""
      }`}
    >
      {content}
    </View>
  );
}