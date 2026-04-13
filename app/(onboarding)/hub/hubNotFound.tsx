//hubNotFound.tsx
import {Text, View, Pressable} from 'react-native'
import {router} from "expo-router";
import React from 'react'

import GradientButton from "@/components/general/GradientButton";

import HubNotFoundIllustration from "@/assets/illustrations/onboarding/hubNotFound.svg";

const HubNotFound = () => {
    return (
        <View className="flex-1">
            <View className="flex-[2] justify-center items-center">
                <View className={"w-5/6"}>
                    <HubNotFoundIllustration width="100%" height="100%"/>
                </View>
            </View>
            <View className="flex-1 bg-white px-6 pt-6 rounded-t-3xl justify-between">

                <View className="gap-1">
                    <Text className="text-primaryTo font-bold text-h3 ">
                        No hub found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        We could not find your hub, please check the hub is powered on and ready to pair.
                    </Text>
                </View>

                <View className="w-full pb-6">
                    <GradientButton
                        title={"Retry"}
                        onPress={() => router.replace("/hub/hubSearch")}
                    />
                    <View className="items-center mt-3">
                        <Text className="font-medium text-subtext text-black">
                            Can't find your hub?
                        </Text>
                        <Pressable
                            className="font-medium text-hint text-primaryTo pb-3"
                            onPress={() => router.replace("/hub/hubManualAddress")}
                        >
                            <Text className="font-medium text-hint text-primaryTo pb-3">
                                Manual Address
                            </Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </View>
    )
}

export default HubNotFound
