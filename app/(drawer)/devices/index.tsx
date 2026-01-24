import React from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { router, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";

type Category = {
    key:
        | "lights"
        | "cameras"
        | "doors"
        | "intercom"
        | "speakers"
        | "televisions"
        | "blinds"
        | "windows"
        | "airConditioners";
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
};

const CATEGORIES: Category[] = [
    { key: "lights", label: "Lights", icon: "wb-incandescent" },
    { key: "cameras", label: "Cameras", icon: "videocam" },
    { key: "doors", label: "Doors", icon: "door-front" },
    { key: "intercom", label: "Intercom", icon: "support-agent" },
    { key: "speakers", label: "Speakers", icon: "speaker" },
    { key: "televisions", label: "Televisions", icon: "tv" },
    { key: "blinds", label: "Blinds", icon: "view-column" },
    { key: "windows", label: "Windows", icon: "crop-square" },
    { key: "airConditioners", label: "Air Conditioners", icon: "ac-unit" },
];

export default function DevicesCategoryList() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Devices",
                    headerLeft: () => <BurgerSearchWidget />,
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/(drawer)/devices/add")}
                            hitSlop={10}
                            style={{ paddingRight: 12 }}
                        >
                            <MaterialIcons name="add" size={22} color="#3C7BFF" />
                        </Pressable>
                    ),
                }}
            />

            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="pt-2">
                    {CATEGORIES.map((cat) => {
                        const safeIcon =
                            cat.icon in MaterialIcons.glyphMap ? cat.icon : ("devices" as any);

                        return (
                            <Pressable
                                key={cat.key}
                                onPress={() =>
                                    router.push({
                                        pathname: "/(drawer)/devices/[category]",
                                        params: { category: cat.key, label: cat.label },
                                    })
                                }
                                className="flex-row items-center px-4 py-4 border-b border-gray-100"
                            >
                                <View className="w-8 items-center">
                                    <MaterialIcons name={safeIcon} size={20} color="#111827" />
                                </View>
                                <Text className="text-black font-semibold">{cat.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </>
    );
}
