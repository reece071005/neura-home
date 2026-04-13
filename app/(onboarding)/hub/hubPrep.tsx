import {StyleSheet, Text, View, Dimensions} from 'react-native'
import {router} from "expo-router";
import React from 'react'

import GradientButton from "@/components/general/GradientButton";

import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HubPrep = () => {
    return (
        <View className="flex-1">
            <View className="flex-[2] justify-center items-center">
                <View className={"w-5/6"}>
                    <HubSetupIllustration width="100%" height="100%"/>
                </View>
            </View>
            <View className="flex-1 bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-3">
                    <Text className="text-primaryTo font-bold text-h3 ">
                        Make sure your Neura Home Hub is ready for connection.
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        1. Plug the hub into power and for the first light to turn solid blue.{"\n"}
                        2. Plug the hub into ethernet and wait for the second light to turn solid blue.
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <GradientButton
                        title={"Continue"}
                        onPress={() => router.replace("/hub/hubSearch")}
                    />
                </View>
            </View>
        </View>
    )
}

export default HubPrep
const styles = StyleSheet.create({})
