import React from "react";
import { Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const Chip = ({ label, onPress }: { label: string; onPress?: () => void }) => {
    return (
        <Pressable className="px-4 py-2 rounded-full border border-gray-300 bg-white">
            <Text className="text-black text-subtext font-medium">{label}</Text>
        </Pressable>
    );
};

const VoiceAssistant = () => {
    return (
        <View className="flex-1">
            <View className="flex-1 px-5 pt-36 pb-6">
                <View className="flex-1 bg-white rounded-3xl px-6 pt-6">
                    <Text className="text-h3 font-bold text-black">
                        Good Morning, User!
                    </Text>
                    <Text className="text-body font-medium text-black mt-2">
                        What can I help you with?
                    </Text>

                    <View className="mt-6 flex-row flex-wrap gap-3">
                        <Chip label="Turn on the lights" />
                        <Chip label="Close the blinds" />
                        <Chip label="Add device" />
                        <Chip label="What are the latest deliveries" />
                        <Chip label="Show me the camera feeds" />
                    </View>

                    {/* Mic button */}
                    <View className="mt-auto pb-8 items-center">
                        <Pressable
                            className="w-20 h-20 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: "#4AA8FF",
                                shadowOpacity: 0.25,
                                shadowRadius: 12,
                                shadowOffset: { width: 0, height: 6 },
                            }}
                        >
                            <MaterialIcons name="mic" size={36} color="white" />
                        </Pressable>
                    </View>

                    {/* Keyboard button */}
                    <View className="absolute right-5 bottom-5">
                        <Pressable
                            className="w-10 h-10 rounded-full items-center justify-center bg-gray-100"
                            style={{
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                                shadowOffset: { width: 0, height: 3 },
                            }}
                        >
                            <MaterialIcons name="keyboard" size={18} color="#4AA8FF" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default VoiceAssistant;