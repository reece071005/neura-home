import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function DevicesByCategory() {
    const params = useLocalSearchParams<{ label?: string }>();
    const title = params.label ?? "Devices";

    return (
        <>
            <Stack.Screen
                options={{
                    title,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} style={{ paddingLeft: 12 }} hitSlop={10}>
                            <MaterialIcons name="chevron-left" size={28} color="#3C7BFF" />
                        </Pressable>
                    ),
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/(drawer)/devices/add")}
                            style={{ paddingRight: 12 }}
                            hitSlop={10}
                        >
                            <MaterialIcons name="add" size={22} color="#3C7BFF" />
                        </Pressable>
                    ),
                }}
            />

            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="pt-2" />
            </ScrollView>
        </>
    );
}
