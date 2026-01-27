import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

/* ---------------- Types ---------------- */

type AlertCard = {
    id: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    text: string;
};

type CameraTile = {
    id: string;
    label: string;
};

/* ---------------- Components ---------------- */

const AlertTile = ({
                       item,
                       onClose,
                   }: {
    item: AlertCard;
    onClose: (id: string) => void;
}) => {
    return (
        <View
            className="bg-white rounded-2xl px-4 py-3 flex-1"
            style={{
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            }}
        >
            <Pressable
                onPress={() => onClose(item.id)}
                className="absolute right-2 top-2 z-10"
                hitSlop={10}
            >
                <MaterialIcons name="close" size={18} color="#EF4444" />
            </Pressable>

            <View className="flex-row gap-3 items-start pr-4">
                <MaterialIcons name={item.icon} size={22} color="#111827" />
                <Text className="text-black font-medium flex-1">{item.text}</Text>
            </View>
        </View>
    );
};

const CameraCard = ({ tile }: { tile: CameraTile }) => {
    return (
        <Pressable
            className="flex-1"
            onPress={() =>
                router.push({
                    // ✅ NOTE: fullscreen is outside (tabs), so no tab bar
                    pathname: "/(onboarding)/cameraFullscreen",
                    params: { id: tile.id, label: tile.label },
                })
            }
        >
            <View
                className="rounded-2xl overflow-hidden"
                style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                }}
            >
                {/* Placeholder “video” area */}
                <View className="h-36 bg-black/40" />

                {/* Label overlay */}
                <View className="absolute left-2 bottom-2">
                    <View className="px-2 py-1 rounded-lg bg-black/60">
                        <Text className="text-white text-xs font-semibold">{tile.label}</Text>
                    </View>
                </View>

                {/* LIVE marker */}
                <View className="absolute right-2 top-2">
                    <Text className="text-white/80 text-[10px] font-medium">LIVE</Text>
                </View>
            </View>
        </Pressable>
    );
};

const SectionHeader = ({
                           icon,
                           title,
                       }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
}) => {
    return (
        <View className="flex-row items-center gap-2 mt-5 mb-3">
            <MaterialIcons name={icon} size={22} color="white" />
            <Text className="text-white font-bold text-lg">{title}</Text>
        </View>
    );
};

/* ---------------- Screen ---------------- */

const CameraDashboard = () => {
    const [alerts, setAlerts] = useState<AlertCard[]>([
        {
            id: "a1",
            icon: "inventory-2",
            text: "A package was left at the front door at 11:38am.",
        },
        {
            id: "a2",
            icon: "logout",
            text: "User arrived home at 12:30pm.",
        },
    ]);

    const pinnedCameras = useMemo<CameraTile[]>(
        () => [
            { id: "p1", label: "Front Door" },
            { id: "p2", label: "Front Door" },
            { id: "p3", label: "Front Door" },
            { id: "p4", label: "Front Door" },
        ],
        []
    );

    const recentActivity = useMemo<CameraTile[]>(
        () => [
            { id: "r1", label: "Front Door" },
            { id: "r2", label: "Front Door" },
            { id: "r3", label: "Front Door" },
            { id: "r4", label: "Front Door" },
        ],
        []
    );

    const removeAlert = (id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{
                paddingHorizontal: 18,
                paddingTop: 130,
                paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Alerts */}
            <View className="flex-row gap-3">
                {alerts.slice(0, 2).map((a) => (
                    <AlertTile key={a.id} item={a} onClose={removeAlert} />
                ))}
            </View>

            {/* Pinned */}
            <SectionHeader icon="place" title="Pinned" />
            <View className="flex-row gap-4">
                <CameraCard tile={pinnedCameras[0]} />
                <CameraCard tile={pinnedCameras[1]} />
            </View>
            <View className="flex-row gap-4 mt-4">
                <CameraCard tile={pinnedCameras[2]} />
                <CameraCard tile={pinnedCameras[3]} />
            </View>

            {/* Recent Activity */}
            <SectionHeader icon="local-activity" title="Recent Activity" />
            <View className="flex-row gap-4">
                <CameraCard tile={recentActivity[0]} />
                <CameraCard tile={recentActivity[1]} />
            </View>
            <View className="flex-row gap-4 mt-4">
                <CameraCard tile={recentActivity[2]} />
                <CameraCard tile={recentActivity[3]} />
            </View>

            <View className="h-8" />
        </ScrollView>
    );
};

export default CameraDashboard;
