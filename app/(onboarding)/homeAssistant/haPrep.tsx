import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import React from "react";

import GradientButton from "@/components/GradientButton";
import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HaPrep = () => {
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1.6 }} className="justify-center items-center">
                <View className="w-5/6">
                    <HubSetupIllustration width="100%" height="100%" />
                </View>
            </View>

            <View
                style={{ flex: 1.4 }}
                className="bg-white px-6 pt-6 rounded-t-3xl"
            >
                <View className="gap-3">
                    <Text className="text-primaryTo font-bold text-h3">
                        Make sure Home Assistant is ready for connection.
                    </Text>

                    <Text className="text-textSecondary text-body font-semibold">
                        1. Ensure Home Assistant is powered on and fully booted.{"\n"}
                        2. Confirm your phone or computer is on the same Wi-Fi network as
                        Home Assistant.{"\n"}
                    </Text>
                </View>

                <View className="flex-1 justify-center items-center">
                    <GradientButton
                        title="Continue"
                        onPress={() => router.replace("/homeAssistant/haSearch")}
                    />
                </View>
            </View>
        </View>
    );
};

export default HaPrep;

const styles = StyleSheet.create({});
