import React from "react";
import { Pressable, Text, View } from "react-native";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";
import { Icons } from "@/assets/illustrations/customMaterialIcons";

const Chip = ({ label, onPress }: { label: string; onPress?: () => void }) => {
    return (
        <Pressable
            onPress={onPress}
            className="px-4 py-2 rounded-full border border-gray-300 bg-white"
        >
            <Text className="text-black text-subtext font-medium">{label}</Text>
        </Pressable>
    );
};

const VoiceAssistant = () => {
    const MicIcon =
        "microphone" in Icons
            ? (Icons.microphone.filled ?? Icons.microphone.default)
            : null;

    const KeyboardIcon =
        "keyboard" in Icons
            ? (Icons.keyboard.outline ?? Icons.keyboard.default)
            : null;

    return (
        <View className="flex-1">
            {/* Top-left burger + search */}
            <View className="absolute top-safe left-safe pl-3 pt-3 z-50">
                <BurgerSearchWidget />
            </View>

            {/* Main white panel */}
            <View className="flex-1 px-5 pt-24 pb-6">
                <View className="flex-1 bg-white rounded-3xl px-6 pt-6">
                    <Text className="text-h3 font-bold text-black">
                        Good Morning, User!
                    </Text>
                    <Text className="text-body font-medium text-black mt-2">
                        What can I help you with?
                    </Text>

                    {/* Suggestion chips */}
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
                            onPress={() => {
                                // TODO: hook up voice capture
                            }}
                            className="w-20 h-20 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: "#4AA8FF",
                                shadowOpacity: 0.2,
                                shadowRadius: 10,
                                shadowOffset: { width: 0, height: 6 },
                            }}
                        >
                            {MicIcon && <MicIcon width={36} height={36} />}
                        </Pressable>
                    </View>

                    {/* Keyboard icon */}
                    {KeyboardIcon && (
                        <View className="absolute right-6 bottom-6">
                            <Pressable
                                onPress={() => {
                                    // TODO: switch to text input mode
                                }}
                                className="w-10 h-10 items-center justify-center"
                            >
                                <KeyboardIcon width={22} height={22} />
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default VoiceAssistant;
