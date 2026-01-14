import {StyleSheet, Text, View, Dimensions} from 'react-native'
import {router, Link} from "expo-router";
import React from 'react'

import GradientButton from "@/components/GradientButton";

import HubNotFoundIllustration from "@/assets/illustrations/hubNotFound.svg";

const HubNotFound = () => {
    return (
        <View className="flex-1">
            <View className="flex-[2] justify-center items-center">
                <View className={"w-5/6"}>
                    <HubNotFoundIllustration width="100%" height="100%"/>
                </View>
            </View>
            <View className="flex-1 bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-3">
                    <Text className="text-primaryTo font-bold text-h3 ">
                        No hub found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        We could not find your hub, please check the hub is powered on and ready to pair.
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <GradientButton
                        title={"Retry"}
                        onPress={() => router.push("/(onboarding)/hubSearch")}
                    />
                    <View className="items-center mt-3">
                        <Text className="font-medium text-subtext text-black">Can't find your hub?</Text>
                        <Link className="font-regular text-hint text-primaryTo"   href={"/(onboarding)/manualAddress"}>Manual Address</Link>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default HubNotFound
