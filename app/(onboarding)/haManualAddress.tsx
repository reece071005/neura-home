import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HaManualAddress = () => {
    const [address, setAddress] = useState("");

    return (
        <View className="flex-1">
            <View className="flex-[2] justify-center items-center">
                <View className="w-5/6">
                    <HubSetupIllustration width="100%" height="100%" />
                </View>
            </View>

            <View className="flex-1 bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo font-bold text-h3">
                        Manual address
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        If Home Assistant was not detected automatically, enter its address
                        below.
                    </Text>
                </View>

                <View className="flex-1 justify-center items-center gap-10">
                    <GradientTextInput
                        value={address}
                        onChangeText={setAddress}
                        placeholder="e.g. http://homeassistant.local:8123"
                        autoCapitalize="none"
                        keyboardType="url"
                    />

                    <GradientButton
                        title="Submit"
                        onPress={() => router.push("/(onboarding)/haFound")} // wire up later
                    />
                </View>
            </View>
        </View>
    );
};

export default HaManualAddress;

const styles = StyleSheet.create({});