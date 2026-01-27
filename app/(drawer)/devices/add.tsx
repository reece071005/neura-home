import React, { useMemo, useState } from "react";
import {
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    KeyboardAvoidingView,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import Spinner from "@/components/Spinner";

type FoundDevice = {
    id: string;
    name: string;
    ip: string;
};

function goBackSmart(navigation: any) {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else router.push("/(drawer)/devices");
}

export default function AddDevice() {
    const navigation = useNavigation();

    const [manualOpen, setManualOpen] = useState(false);
    const [manualName, setManualName] = useState("");
    const [manualIp, setManualIp] = useState("");
    const [manualPort, setManualPort] = useState("");

    const found = useMemo<FoundDevice[]>(
        () => [
            { id: "f1", name: "Samsung Air Conditioner", ip: "192.182.1.32" },
            { id: "f2", name: "LG Air Conditioner", ip: "192.182.1.33" },
            { id: "f3", name: "Samsung Air Conditioner", ip: "192.182.1.34" },
            { id: "f4", name: "Samsung Air Conditioner", ip: "192.182.1.35" },
            { id: "f5", name: "Samsung Air Conditioner", ip: "192.182.1.36" },
        ],
        []
    );

    return (
        <View className="flex-1">
            {/* top gradient comes from your Tabs LinearGradient background */}
            <View className="flex-1" />

            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                {/* Title + subtitle */}
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Searching for a Device
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Neura Home is searching for any available devices. This may take a few
                        minutes.
                    </Text>
                </View>

                {/* Spinner (smaller) */}
                <View className="items-center justify-center mt-4">
                    <View
                        className="relative items-center justify-center"
                        style={{ width: 200, height: 200 }} // ✅ smaller
                    >
                        <Spinner size={200} />
                        <View className="absolute inset-0 items-center justify-center">
                            <Image
                                source={require("../../../assets/logo/png/logoGradientSquareNoText.png")}
                                style={{ width: 140, height: 140 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </View>

                {/* Found list + manual link */}
                <View className="flex-1 mt-4">
                    <Text className="text-primaryTo text-body font-bold mb-2">
                        Devices Found
                    </Text>

                    {/* ✅ Give the list more space, keep scrolling */}
                    <View className="flex-1 rounded-2xl border border-gray-100 overflow-hidden">
                        <ScrollView
                            className="flex-1"
                            contentContainerStyle={{ paddingVertical: 6 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {found.map((d) => (
                                <Pressable
                                    key={d.id}
                                    onPress={() => {
                                        // later: attach device flow
                                    }}
                                    className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                                >
                                    <View className="w-8 items-center">
                                        <MaterialIcons name="devices" size={18} color="#111827" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-textPrimary font-semibold">
                                            {d.name}
                                        </Text>
                                        <Text className="text-textSecondary text-xs font-semibold">
                                            {d.ip}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>

                    <Pressable
                        className="items-center py-5"
                        onPress={() => setManualOpen(true)}
                    >
                        <Text className="text-textSecondary text-body font-semibold">
                            Add address manually
                        </Text>
                    </Pressable>

                    {/* optional back (if you still want it inside page) */}
                    <Pressable
                        className="items-center pb-4"
                        onPress={() => goBackSmart(navigation)}
                        hitSlop={10}
                    >
                        <Text className="text-primaryTo text-body font-bold">Back</Text>
                    </Pressable>
                </View>
            </View>

            {/* ✅ Manual Address Popup */}
            <Modal
                visible={manualOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setManualOpen(false)}
            >
                <Pressable
                    className="flex-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                    onPress={() => setManualOpen(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        className="flex-1 justify-center px-6"
                    >
                        {/* stop propagation so tapping inside doesn't close */}
                        <Pressable
                            onPress={() => {}}
                            className="bg-white rounded-3xl px-5 py-5"
                            style={{
                                shadowOpacity: 0.15,
                                shadowRadius: 18,
                                shadowOffset: { width: 0, height: 10 },
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-textPrimary font-bold text-lg">
                                    Add device manually
                                </Text>
                                <Pressable onPress={() => setManualOpen(false)} hitSlop={10}>
                                    <MaterialIcons name="close" size={22} color="#111827" />
                                </Pressable>
                            </View>

                            <Text className="text-textSecondary text-xs font-semibold mb-2">
                                Enter the device information.
                            </Text>

                            <View className="gap-3">
                                <View className="border border-gray-200 rounded-2xl px-4 py-3">
                                    <Text className="text-gray-500 text-[11px] font-semibold mb-1">
                                        Device name
                                    </Text>
                                    <TextInput
                                        value={manualName}
                                        onChangeText={setManualName}
                                        placeholder="e.g. Living Room AC"
                                        className="text-textPrimary"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View className="border border-gray-200 rounded-2xl px-4 py-3">
                                    <Text className="text-gray-500 text-[11px] font-semibold mb-1">
                                        IP address
                                    </Text>
                                    <TextInput
                                        value={manualIp}
                                        onChangeText={setManualIp}
                                        placeholder="e.g. 192.168.1.20"
                                        className="text-textPrimary"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View className="border border-gray-200 rounded-2xl px-4 py-3">
                                    <Text className="text-gray-500 text-[11px] font-semibold mb-1">
                                        Port (optional)
                                    </Text>
                                    <TextInput
                                        value={manualPort}
                                        onChangeText={setManualPort}
                                        placeholder="e.g. 8123"
                                        className="text-textPrimary"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="number-pad"
                                    />
                                </View>

                                <Pressable
                                    onPress={() => {
                                        // TODO: attach device using manualName/manualIp/manualPort
                                        setManualOpen(false);
                                        setManualName("");
                                        setManualIp("");
                                        setManualPort("");
                                    }}
                                    className="rounded-2xl py-3 items-center"
                                    style={{ backgroundColor: "#3C7BFF" }}
                                >
                                    <Text className="text-white font-bold">Add device</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </View>
    );
}
