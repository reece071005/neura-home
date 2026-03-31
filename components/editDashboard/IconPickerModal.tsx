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
    embedded?: boolean;
};

type IconItem = { key: string; path: string };
const ICONS_WITHOUT_QUERY_LIMIT = 180;

const ALL_ICONS: IconItem[] = Object.entries(mdi)
  .filter(([k, v]) => k.startsWith("mdi") && typeof v === "string")
  .map(([k, v]) => ({ key: k, path: v as string }))
  .sort((a, b) => a.key.localeCompare(b.key));

export default function IconPickerModal({
  visible,
  onClose,
  onSelect,
  selectedPath,
  title = "Choose an icon",
  embedded = false,
}: Props) {
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return ALL_ICONS.slice(0, ICONS_WITHOUT_QUERY_LIMIT);

        // match by export name: mdiHome, mdiLightbulb, etc.
         return ALL_ICONS.filter((x) => x.key.toLowerCase().includes(t));
         }, [q]);

    if (!visible) return null;

    const content = (
      <Pressable
          onPress={onClose}
          style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              padding: 18,
              justifyContent: "center",
          }}
      >
          <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                  backgroundColor: "white",
                  borderRadius: 24,
                  overflow: "hidden",
                  maxHeight: "85%",
              }}
          >
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
                  {!q.trim() && (
                    <Text style={{ marginTop: 4, fontSize: 12, color: "#9CA3AF" }}>
                      Showing first {ICONS_WITHOUT_QUERY_LIMIT}. Search to see all icons.
                    </Text>
                  )}
              </View>

              <FlatList
                  data={filtered}
                  keyExtractor={(x) => x.key}
                  numColumns={6}
                  initialNumToRender={36}
                  maxToRenderPerBatch={36}
                  windowSize={7}
                  removeClippedSubviews
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
    );

    if (embedded) {
      return (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 40 }}>
          {content}
        </View>
      );
    }

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        {content}
      </Modal>
    );
}
