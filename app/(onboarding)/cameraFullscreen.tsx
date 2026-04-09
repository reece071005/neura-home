import React from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

const CameraFullScreen = () => {
    const params = useLocalSearchParams<{ id?: string; label?: string }>();
    const label = params.label ?? "Camera";
    const id = params.id ?? "unknown";

    return (
        <View className="flex-1 bg-black">
            {/* Title */}
            <View className="absolute top-safe left-0 right-0 pt-4 items-center z-[998]">
                <View className="px-3 py-2 rounded-full bg-black/60">
                    <Text className="text-white font-semibold">{label}</Text>
                </View>
            </View>

            {/* Video placeholder */}
            <View className="flex-1" />

            {/* Bottom live tag */}
            <View className="absolute bottom-6 left-6">
                <View className="px-3 py-2 rounded-full bg-black/60">
                    <Text className="text-white text-xs font-medium">LIVE • {id}</Text>
                </View>
            </View>
        </View>
    );
};

export default CameraFullScreen;
