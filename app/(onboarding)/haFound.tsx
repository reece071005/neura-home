import React from "react";
import { Text, Pressable, View } from "react-native";
import { router } from "expo-router";

import NeuraHubIcon from "@/assets/illustrations/neuraHubIcon.svg";

const HaFound = () => {
    return (
        <View className="flex-1">
            {/* Top spacer */}
            <View className="flex-1" />

            {/* Bottom panel */}
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Home Assistant found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Select the Home Assistant instance you want to connect to.
                    </Text>
                </View>

                {/* Hardcoded HA list */}
                <View className="mt-4 gap-4">
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(onboarding)/haLogin",
                                params: {
                                    id: "ha-1",
                                    name: "Home Assistant",
                                    url: "http://homeassistant.local:8123",
                                },
                            })
                        }
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">Home Assistant</Text>
                            <Text className="font-regular text-subtext">
                                http://homeassistant.local:8123
                            </Text>
                            <Text className="text-hint text-xs mt-0.5">Ready to sign in</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(onboarding)/haLogin",
                                params: {
                                    id: "ha-2",
                                    name: "Home Assistant (Server)",
                                    url: "http://192.168.1.50:8123",
                                },
                            })
                        }
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">
                                Home Assistant (Server)
                            </Text>
                            <Text className="font-regular text-subtext">
                                http://192.168.1.50:8123
                            </Text>
                            <Text className="text-hint text-xs mt-0.5">Ready to sign in</Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(onboarding)/haLogin",
                                params: {
                                    id: "ha-3",
                                    name: "Home Assistant (Backup)",
                                    url: "http://192.168.1.51:8123",
                                },
                            })
                        }
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">
                                Home Assistant (Backup)
                            </Text>
                            <Text className="font-regular text-subtext">
                                http://192.168.1.51:8123
                            </Text>
                            <Text className="text-hint text-xs mt-0.5">Ready to sign in</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default HaFound;