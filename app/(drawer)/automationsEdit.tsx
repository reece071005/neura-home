import React from "react";
import {View, Text, TextInput, Pressable, ScrollView} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// ICONS
import BackArrowIcon from "@/assets/icons/backArrow.svg";
import PlusIconWhite from "@/assets/icons/plusIconWhite.svg";

export default function AutomationsEditScreen() {
    return (
        <SafeAreaView edges={["top"]} className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 24, paddingTop: 20}}>
            <View className="flex-1 bg-white px-4">
                {/* HEADER */}
                <View className="flex-row items-center mb-8">
                    <Pressable
                        onPress={() => router.replace("/automations")}
                        className="mr-3"
                    >
                        <BackArrowIcon width={24} height={24} />
                    </Pressable>

                    <TextInput
                        placeholder="Routine Name"
                        placeholderTextColor="#8E8E8E"
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 font-poppins text-base"
                    />
                </View>

                {/* WHEN */}
                <View className="mb-8">
                    <Text className="font-poppins font-bold text-lg mb-1">
                        When
                    </Text>
                    <Text className="font-poppins text-gray-500 mb-4">
                        This should be a specific event that will trigger your automation.
                    </Text>

                    <Pressable className="flex-row items-center self-start bg-blue-500 px-5 py-2 rounded-full">
                        <PlusIconWhite width={14} height={14} />
                        <Text className="ml-2 font-poppins text-white font-semibold">
                            Add Event
                        </Text>
                    </Pressable>
                </View>

                {/* IF OPTIONAL */}
                <View className="mb-8">
                    <Text className="font-poppins font-bold text-lg mb-1">
                        If (Optional)
                    </Text>
                    <Text className="font-poppins text-gray-500 mb-4">
                        These are optional conditions that must be true before an automation runs.
                    </Text>

                    <Pressable className="flex-row items-center self-start bg-blue-500 px-5 py-2 rounded-full">
                        <PlusIconWhite width={14} height={14} />
                        <Text className="ml-2 font-poppins text-white font-semibold">
                            Add If
                        </Text>
                    </Pressable>
                </View>

                {/* THEN DO */}
                <View className="mb-8">
                    <Text className="font-poppins font-bold text-lg mb-1">
                        Then Do
                    </Text>
                    <Text className="font-poppins text-gray-500 mb-4">
                        These are the actions your automation will perform when triggered.
                    </Text>

                    <Pressable className="flex-row items-center self-start bg-blue-500 px-5 py-2 rounded-full">
                        <PlusIconWhite width={14} height={14} />
                        <Text className="ml-2 font-poppins text-white font-semibold">
                            Add Then
                        </Text>
                    </Pressable>
                </View>
            </View>
                </ScrollView>
        </SafeAreaView>
    );
}
