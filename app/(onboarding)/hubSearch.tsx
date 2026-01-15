import {Image, Text, View} from 'react-native';
import {Link, router} from "expo-router"
import React, { useEffect, useRef } from 'react';

import Logo from '@/components/Logo';
import Spinner from "@/components/Spinner";

import {startHubDiscovery} from "@/services/hubDiscovery";

const HubSearch = () => {
    const navigated = useRef(false);

    useEffect(()=> {
        const stop = startHubDiscovery({
            timeoutMs: 6000,
            fake: {outcome: "found", delayMs: 2000},

            onFound: (hub) => {
                if (navigated.current) return;
                navigated.current = true;

                router.replace({
                    pathname: "/(onboarding)/hubFound",
                    params: {id: hub.id, name: hub.name, ip: hub.ip}
                });
            },

            onTimeout: () => {
                if (navigated.current) return;
                navigated.current = true;

                router.replace("/(onboarding)/hubNotFound");
            },
        });
        return stop;
    }, []);

    return (
        <View className="flex-1">
            <View className="flex-1"></View>
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Searching for your hub
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Neura Home is searching for your hub this may take a few minutes
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center">
                    <View className="relative items-center justify-center" style={{width:260, height:260}}>
                        <Spinner size={260}></Spinner>
                        <View className="absolute inset-0 items-center justify-center">
                            <Image
                                source={require("../../assets/logo/png/logoGradientSquareNoText.png")}
                                style-={{width:180, height:180}}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Link href="/(onboarding)/manualAddress" className="mt-36">
                        <Text className="text-textSecondary text-body font-semibold">
                            Add address manually
                        </Text>
                    </Link>
                </View>
            </View>
        </View>
    )
}
export default HubSearch
