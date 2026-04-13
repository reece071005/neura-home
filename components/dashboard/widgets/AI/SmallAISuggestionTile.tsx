import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import Card from "@/components/dashboard/Card";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { runAutomation } from "@/lib/api/ai/aiRunAutomation";

type Suggestion = {
  type: string;
  entity_id: string;
  action: Record<string, any>;
  confidence: number;
};

type Props = {
  title: string;
  room: string;
  suggestions: Suggestion[];
};

const getSuggestionVisual = (suggestion?: Suggestion) => {
  if (!suggestion) {
    return {
      icon: "robot-outline",
      color: "#7A7A7A",
      description: "No suggestions",
    };
  }

  const confidence = Math.round((suggestion.confidence ?? 0) * 100);
  const action = suggestion.action ?? {};

  if (suggestion.type === "light") {
    const state = action.state === "off" ? "off" : "on";
    const brightness =
      typeof action.brightness === "number"
        ? ` at ${action.brightness}`
        : "";

    return {
      icon: "lightbulb-on-outline",
      color: "#F4C400",
      description: `Turn light ${state}${brightness} (${confidence}% Confidence)`,
    };
  }

  if (suggestion.type === "fan") {
    const pct =
      typeof action.percentage === "number"
        ? `${action.percentage}%`
        : "speed";

    return {
      icon: "fan",
      color: "#4A90E2",
      description: `Set fan ${pct} (${confidence}% Confidence)`,
    };
  }

  if (suggestion.type === "climate") {
    const temp =
      typeof action.temperature === "number"
        ? ` to ${action.temperature}°`
        : "";

    const mode =
      typeof action.hvac_mode === "string"
        ? ` (${action.hvac_mode})`
        : "";

    return {
      icon: "thermometer",
      color: "#E67E22",
      description: `Adjust climate${temp}${mode} (${confidence}% Confidence)`,
    };
  }

  const [key, value] = Object.entries(action)[0] ?? [];

  return {
    icon: "robot-outline",
    color: "#7A7A7A",
    description: key
      ? `${key}: ${String(value)} (${confidence}% Confidence)`
      : `Action suggested (${confidence}%)`,
  };
};

export default function SmallAISuggestionTile({
  title,
  room,
  suggestions,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [executingAll, setExecutingAll] = useState(false);

  const hasSuggestions = (suggestions?.length ?? 0) > 0;

  const tileVisual = useMemo(() => {
    if (!hasSuggestions) {
      return getSuggestionVisual(undefined);
    }

    return {
      icon: "brain",
      color: "#4985EE",
      description: `${suggestions.length} suggestion${
        suggestions.length > 1 ? "s" : ""
      } available`,
    };
  }, [hasSuggestions, suggestions]);

  async function executeAllSuggestions() {
    try {
      setExecutingAll(true);
      console.log(room);
      await runAutomation(room);

      setModalVisible(false);
    } catch (err) {
      console.error("Automation failed", err);
    } finally {
      setExecutingAll(false);
    }
  }

  return (
    <>
      {/* Dashboard Tile */}
      <Card variant="small">
        <Pressable
          disabled={!hasSuggestions}
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => ({
            flex: 1,
            justifyContent: "center",
            opacity: pressed && hasSuggestions ? 0.8 : 1,
          })}
        >
          <View className="flex-row items-center" style={{ minHeight: "100%" }}>
            <View
              style={{
                width: 36,
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={tileVisual.icon as any}
                size={28}
                color={tileVisual.color}
              />
            </View>

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="text-body font-medium text-black"
              >
                {title}
              </Text>

              <Text
                className="text-subtext font-medium"
                style={{ color: tileVisual.color }}
              >
                {tileVisual.description}
              </Text>
            </View>
          </View>
        </Pressable>
      </Card>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setModalVisible(false)}
          />

          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 24,
              maxHeight: "70%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                AI Suggestions
              </Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: "#6B7280",
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>

            {/* Suggestions */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {suggestions.map((item, index) => {
                const visual = getSuggestionVisual(item);

                return (
                  <View
                    key={`${item.entity_id}-${index}`}
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 10,
                      padding: 14,
                      marginBottom: 10,
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={visual.icon as any}
                        size={18}
                        color={visual.color}
                      />

                      <Text
                        style={{
                          marginLeft: 8,
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#111827",
                          flex: 1,
                        }}
                      >
                        {item.entity_id}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 13,
                        color: "#374151",
                      }}
                    >
                      {visual.description}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            {/* Execute All Button */}
            <View
              style={{
                marginTop: 15,
                paddingTop: 0,
                paddingBottom: 15,
                alignItems: "center",
              }}
            >
              <Pressable
                disabled={executingAll}
                onPress={executeAllSuggestions}
                style={({ pressed }) => ({
                  width: "85%",
                  backgroundColor: executingAll ? "#9CA3AF" : "#4985EE",
                  paddingBottom: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                {executingAll ? (
                  <ActivityIndicator size="small" color="#4985EE" />
                ) : (
                  <Text
                    style={{
                      color: "#4985EE",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    Execute All Suggestions
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
