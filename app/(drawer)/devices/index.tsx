import React from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { router, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import MdiIcon from "@/components/MdiIcon";

import {
  mdiLightbulb,
  mdiFan,
  mdiToggleSwitch,
  mdiBlinds,
  mdiAirConditioner,
  mdiTelevision,
  mdiCctv,
  mdiMotionSensor
} from "@mdi/js";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";

type Category = {
    key:
        | "lights"
        | "fans"
        | "switches"
        | "blinds"
        | "airConditioners"
        | "mediaPlayers"
        | "cameras"
        | "sensors";
    label: string;
    icon: string;
};

const CATEGORIES: Category[] = [
    { key: "lights", label: "Lights", icon: mdiLightbulb },
    { key: "fans", label: "Fans", icon: mdiFan },
    { key: "switches", label: "Switches", icon: mdiToggleSwitch },
    { key: "blinds", label: "Blinds", icon: mdiBlinds },
    { key: "airConditioners", label: "Air Conditioners", icon: mdiAirConditioner },
    { key: "mediaPlayers", label: "Media Players", icon: mdiTelevision },
    { key: "cameras", label: "Cameras", icon: mdiCctv },
    { key: "sensors", label: "Sensors", icon: mdiMotionSensor },

];

export default function DevicesCategoryList() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: "Devices"
                }}
            />
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="pt-2">
                    {CATEGORIES.map((cat) => {

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
                                <View className="w-[20px] h-[20px] mr-4 items-center justify-center">
                                    <MdiIcon path={cat.icon} size={20} color="#000"></MdiIcon>
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
