import React, { useMemo, useState } from "react";
import { Modal, Pressable, View, Text, TextInput, FlatList } from "react-native";
import * as mdi from "@mdi/js";
import MdiIcon from "@/components/MdiIcon";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelect: (iconPath: string) => void;
    selectedPath?: string;
    title?: string;
};

type IconItem = { key: string; path: string };

export default function IconPickerModal({
  visible,
  onClose,
  onSelect,
  selectedPath,
  title = "Choose an icon",
}: Props) {
    const [q, setQ] = useState("");

    //Create the full icon list
    const allIcons: IconItem[] = useMemo(() => {
        return Object.entries(mdi)
            .filter(([k, v]) => k.startsWith("mdi") && typeof v === "string")
            .map(([k, v]) => ({ key: k, path: v as string }));
        }, []);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return allIcons;

        // match by export name: mdiHome, mdiLightbulb, etc.
         return allIcons.filter((x) => x.key.toLowerCase().includes(t));
         }, [allIcons, q]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {/* Backdrop */}
            <Pressable
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    padding: 18,
                    justifyContent: "center",
                }}
            >
                {/* Content */}
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: "white",
                        borderRadius: 24,
                        overflow: "hidden",
                        maxHeight: "85%",
                    }}
                >
                    {/* Header */}
                    <View style={{ paddingHorizontal: 16, paddingTop: 14}}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Text style={{ fontSize: 16, fontWeight: "800", flex: 1 }}>{title}</Text>
                            <Pressable onPress={onClose} hitSlop={10}>
                                <Text style={{ fontSize: 18, fontWeight: "900" }}>✕</Text>
                            </Pressable>
                        </View>

                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="Search icons… (e.g. home, light, camera)"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            autoCorrect={false}
                            style={{
                                marginTop: 10,
                                borderWidth: 1,
                                borderColor: "#E5E7EB",
                                borderRadius: 16,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                color: "black",
                            }}
                        />

                        <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
                            {filtered.length.toLocaleString()} icons
                        </Text>
                    </View>

                    {/* Grid */}
                    <FlatList
                        data={filtered}
                        keyExtractor={(x) => x.key}
                        numColumns={6}
                        contentContainerStyle={{ padding: 12, paddingBottom: 18 }}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => {
                            const active = selectedPath === item.path;

                            return (<Pressable
                                    onPress={() => onSelect(item.path)}
                                    style={{
                                        width: "16.666%",
                                        padding: 8,
                                    }}
                                >
                                    <View
                                        style={{
                                            height: 46,
                                            borderRadius: 14,
                                            borderWidth: 1,
                                            borderColor: active ? "black" : "#E5E7EB",
                                            backgroundColor: active ? "rgba(0,0,0,0.06)" : "white",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MdiIcon path={item.path} size={22} color="#111827" />
                                    </View>
                            </Pressable>
                            );
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}
