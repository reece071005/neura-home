import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "@/components/dashboard/Card";
import { getCameraSnapshotDataUri } from "@/lib/api/deviceControllers/camera";

type Props = {
    title: string;
    cameraEntity: string;
    onMenuPress?: () => void;
};

export default function LargeCameraTile({ title, cameraEntity, onMenuPress }: Props) {
    const [uri, setUri] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [hadError, setHadError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const inFlightRef = useRef(false);

    const load = async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        setLoading(true);
        setHadError(false);
        try {
            const next = await getCameraSnapshotDataUri(cameraEntity);
            setUri(next);
            setLastUpdated(new Date());
        } catch (e) {
            setHadError(true);
        } finally {
            setLoading(false);
            inFlightRef.current = false;
        }
    };

    // Load once for the tile when the camera changes

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [cameraEntity]);

  // Refresh once when modal opens
  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
      <>
          <Card variant="large" transparent noPadding>
              <View className="flex-1 pt-1.5">
                  {!!onMenuPress && (
                      <View style={{ position: "absolute", top: 6, right: 6, zIndex: 10 }}>
                          <Pressable onPress={onMenuPress} hitSlop={10}>
                              <MaterialIcons name="more-vert" size={26} color="white" />
                          </Pressable>
                      </View>
                  )}

                  <Pressable
                      onPress={() => setOpen(true)}
                      className="flex-1"
                      style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1 }]}
                  >
                      <View className="overflow-hidden" style={{ borderRadius: 22, height: 160 }}>
                          {!!uri ? (
                              <Image
                                  source={{ uri }}
                                  style={{ width: "100%", height: "100%" }}
                                  resizeMode="cover"
                                  fadeDuration={0}
                              />
                          ) : (<View
                                  style={{
                                      width: "100%",
                                      height: "100%",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#0B5AA6",
                                  }}
                              >
                                  <Text style={{ color: "white", fontWeight: "700" }}>
                                      {loading ? "Loading…" : hadError ? "No image" : "Loading…"}
                                  </Text>
                          </View>
                          )}

                          {/* Title pill */}
                          <View style={{ position: "absolute", bottom: 10, left: 10 }}>
                              <View
                                  style={{
                                      backgroundColor: "rgba(0,0,0,0.55)",
                                      paddingHorizontal: 10,
                                      paddingVertical: 6,
                                      borderRadius: 12,
                                  }}
                              >
                                  <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
                                      {title}
                                  </Text>
                              </View>
                          </View>
                      </View>
                  </Pressable>
              </View>
          </Card>

          <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
              <Pressable
                  onPress={() => setOpen(false)}
                  style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.65)",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                  }}
              >
                  <Pressable
                      onPress={() => {}}
                      style={{
                          width: "100%",
                          maxWidth: 520,
                          borderRadius: 24,
                          backgroundColor: "white",
                          padding: 15,
                      }}
                  >
                      {/* Header */}
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text numberOfLines={1} style={{ fontWeight: "800", fontSize: 16, flex: 1 }}>
                              {title}
                          </Text>

                          {/* Refresh */}
                          <Pressable onPress={load} hitSlop={10} style={{ marginRight: 10 }}>
                              <MaterialIcons name="refresh" size={22} color="black" />
                          </Pressable>

                          {/* Close */}
                          <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                              <MaterialIcons name="close" size={22} color="black" />
                          </Pressable>
                      </View>

                      {/* Last updated */}
                      <Text style={{ marginTop: 1, color: "#666", fontSize: 12 }}>
                          {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : " "}
                      </Text>

                      {/* Image area (responsive 16:9) */}
                      <View
                          style={{
                              width: "100%",
                              aspectRatio: 16 / 9,
                              marginTop: 10,
                              borderRadius: 16,
                              overflow: "hidden",
                              backgroundColor: "#eee",
                              alignItems: "center",
                              justifyContent: "center",
                          }}
                      >
                          {!!uri ? (
                              <Image
                                  source={{ uri }}
                                  style={{ width: "100%", height: "100%" }}
                                  resizeMode="cover"
                                  fadeDuration={0}
                              />
                          ) : (
                              <Text style={{ color: "#666", fontWeight: "700" }}>
                                  {loading ? "Loading…" : hadError ? "No image" : " "}
                              </Text>
                          )}

                          {loading && (
                              <View
                                  style={{
                                      position: "absolute",
                                      right: 10,
                                      bottom: 10,
                                      backgroundColor: "rgba(0,0,0,0.45)",
                                      paddingHorizontal: 10,
                                      paddingVertical: 6,
                                      borderRadius: 12,
                                  }}
                              >
                                  <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
                                      Refreshing…
                                  </Text>
                              </View>
                          )}
                      </View>
                  </Pressable>
              </Pressable>
          </Modal>
      </>
  );
}

