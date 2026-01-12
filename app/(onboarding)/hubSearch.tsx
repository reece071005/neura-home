import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import Logo from '@/components/Logo';
import Spinner from "@/components/Spinner";

const HubSearch = () => {
    return (
        <View className="flex-1">
            <View className="flex-1"></View>
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-2">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Searching for your hub
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Neura Home is searching for your hub this may take a few minutes
                    </Text>
                </View>
                <View className="flex-1 items-center justify-center">
                    <View className="relative items-center justifty-center">
                        <Spinner size={260}></Spinner>
                        <View className="absolute">
                            <Logo color="gradient" shape="square" text="none" size={160}/>
                        </View>
                    </View>
                    <Text className="text-textSecondary text-body font-semibold">
                        Add address manually
                    </Text>
                </View>
            </View>
        </View>
    )
}
export default HubSearch
