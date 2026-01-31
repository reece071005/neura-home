import React, { useEffect, useMemo, useState} from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { listDevices, type ApiDevice } from "@/lib/api/devices";
import { kindToCategory, type CategoryKey} from "@/utils/deviceCategory";

export default function DevicesByCategory() {
    const params = useLocalSearchParams<{ label?: string; category?: string }>();
    const title = params.label ?? "Devices";
    const category = (params.category ?? "") as CategoryKey;

    const [devices, setDevices] = useState<ApiDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await listDevices();
                if (!cancelled) setDevices(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "failed to load devices");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return() => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        return devices
            .filter((d) => kindToCategory(d.kind) === category)
            .sort((a, b) =>
                (a.name || a.entity_id).localeCompare(b.name || b.entity_id)
            );
    }, [devices, category]);

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
                        <Pressable onPress={() => router.push("/(drawer)/devices/add")} style={{ paddingRight: 12 }} hitSlop={10}>
                            <MaterialIcons name="add" size={22} color="#3C7BFF" />
                        </Pressable>
                    ),
                }}
            />
            <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                <View className="pt-2">
                    {loading && (
                        <View className="py-10 items-center">
                            <ActivityIndicator />
                            <Text className="mt-2 text-gray-500">Loading…</Text>
                        </View>
                    )}

                    {!loading && error && (
                        <View className="px-4 py-6">
                            <Text className="text-red-600 font-semibold">Couldn’t load devices</Text>
                            <Text className="text-gray-600 mt-1">{error}</Text>
                        </View>
                    )}

                    {!loading && !error && filtered.length === 0 && (
                        <View className="px-4 py-6">
                            <Text className="text-gray-500">No devices in this category yet.</Text>
                        </View>
                    )}

                    {!loading &&
                        !error &&
                        filtered.map((d) => (
                            <Pressable
                                key={d.entity_id}
                                className="flex-row items-center px-4 py-4 border-b border-gray-100"
                                onPress={() => {}} //To be completed
                            >
                                <View className="flex-1">
                                    <Text className="text-black text-subtext font-semibold">{d.name || d.entity_id}</Text>
                                    <Text className="text-gray-500 text-hint mt-1">{d.entity_id}</Text>
                                </View>

                                <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
                            </Pressable>
                        ))}
                </View>
            </ScrollView>
        </>
    );
}