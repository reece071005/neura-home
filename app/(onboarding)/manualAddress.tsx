import {StyleSheet, Text, View, Dimensions} from 'react-native'
import {router} from "expo-router";
import React, { useMemo, useState } from 'react'

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HubSetup = () => {
    const [ip, setIp] = useState("");

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
                        Manual address
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        If your device was not detected, you can enter the IP address of your hub
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center gap-10">
                    <GradientTextInput
                          value={ip}
                          onChangeText={setIp}
                          placeholder="e.g. 192.168.1.100"
                          keyboardType="numeric"
                    />
                    <GradientButton
                        title={"Submit"}
                        onPress={() => router.push("")}
                    />
                </View>
            </View>
        </View>
    )
}

export default HubSetup
const styles = StyleSheet.create({})
