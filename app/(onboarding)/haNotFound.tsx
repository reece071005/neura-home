import { StyleSheet, Text, View } from "react-native";
import { router, Link } from "expo-router";
import React from "react";

import GradientButton from "@/components/GradientButton";

import HubNotFoundIllustration from "@/assets/illustrations/hubNotFound.svg";

const HaNotFound = () => {
    return (
        <View className="flex-1">
            <View className="flex-[2] justify-center items-center">
                <View className="w-5/6">
                    <HubNotFoundIllustration width="100%" height="100%" />
                </View>
            </View>

            <View className="flex-1 bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo font-bold text-h3">
                        No Home Assistant found
                    </Text>

                    <Text className="text-textSecondary text-body font-semibold">
                        We couldn’t find a Home Assistant instance on your network. Please
                        make sure it’s powered on and connected to the same network.
                    </Text>
                </View>

                <View className="mt-auto w-full">
                    <GradientButton
                        title="Retry"
                        onPress={() => router.push("/(onboarding)/haSearch")}
                    />

                    <View className="items-center mt-3">
                        <Text className="font-medium text-subtext text-black">
                            Can’t find Home Assistant?
                        </Text>

                        <Link
                            className="font-medium text-hint text-primaryTo"
                            href="/(onboarding)/haManualAddress"
                        >
                            Manual Address
                        </Link>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default HaNotFound;

const styles = StyleSheet.create({});