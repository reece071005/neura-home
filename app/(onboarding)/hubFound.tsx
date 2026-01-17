import React from "react";
import { Text, Pressable, View } from "react-native";
import { router } from "expo-router";

import NeuraHubIcon from "@/assets/illustrations/neuraHubIcon.svg";

const HubFound = () => {
    return (
        <View className="flex-1">
            {/* Top spacer */}
            <View className="flex-1" />

            {/* Bottom panel */}
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Hub found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please select the Neura Home hub you want to connect to.
                    </Text>
                </View>

                {/* Hub list (Hardcoded for now)*/}
                <View className="mt-4 gap-4">
                    {/* Hub 1 → already set up */}
                    <Pressable
                        onPress={() =>
                            router.push("/(onboarding)/hubLogin")
                        }
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">
                                Neura Hub
                            </Text>
                            <Text className="font-regular text-subtext">
                                http://192.168.1.50
                            </Text>
                            <Text className="text-hint text-xs mt-0.5">
                                Already set up
                            </Text>
                        </View>
                    </Pressable>

                    {/* Hub 2 → new account setup */}
                    <Pressable
                        onPress={() =>
                            router.push({
                                pathname: "/(onboarding)/hubNewAccount",
                                params: {
                                    id: "hub-2",
                                    name: "Neura Hub",
                                    ip: "http://192.168.1.51",
                                },
                            })
                        }
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">
                                Neura Hub (Living Room)
                            </Text>
                            <Text className="font-regular text-subtext">
                                http://192.168.1.51
                            </Text>
                            <Text className="text-hint text-xs mt-0.5">
                                Not set up
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default HubFound;