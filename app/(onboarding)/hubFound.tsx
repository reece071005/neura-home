import {Image, Text, Pressable, View} from 'react-native';
import {Link, router} from "expo-router"
import React, { useEffect, useRef } from 'react';

import Logo from '@/components/Logo';
import Spinner from "@/components/Spinner";

import NeuraHubIcon from "@/assets/illustrations/neuraHubIcon.svg";

import {startHubDiscovery} from "@/services/hubDiscovery";

const HubFound = () => {
    return (
        <View className="flex-1">
            <View className="flex-1"></View>
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-2">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Hub's found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please select the Neura Home hub you want to connect to.
                    </Text>
                </View>
                <View className="mt-3 gap-4">
                    <Pressable
                        onPress={() => router.push("/(onboarding)/hubAlreadySetup")}
                        className="flex-row border-2 border-greyButton rounded-3xl p-2 items-center gap-4">
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">Hub 1</Text>
                            <Text className="font-regular text-subtext">http://192.168.1.50</Text>
                        </View>
                    </Pressable>
                    <Pressable className="flex-row border-2 border-greyButton rounded-3xl p-2 items-center gap-4">
                        <NeuraHubIcon width={36} height={36} />
                        <View>
                            <Text className="font-semibold text-body">Hub 2</Text>
                            <Text className="font-regular text-subtext">http://192.168.1.51</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

export default HubFound