import { Text, View } from "react-native";
import { router, Link } from "expo-router";
import React, { useState } from "react";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HaAlreadySetup = () => {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    return (
        <View className="flex-1">
            <View className="flex-[5] justify-center items-center">
                <View className="w-5/6">
                    <SignInIllustration width="100%" height="100%" />
                </View>
            </View>

            <View className="flex-[5] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1 mb-5">
                    <Text className="text-primaryTo font-bold text-h3">
                        Home Assistant is already set up
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please sign in to connect to this Home Assistant instance
                    </Text>
                </View>

                <View className="flex-1 items-center gap-10">
                    <View className="w-full gap-6">
                        <GradientTextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            autoCapitalize="none"
                        />

                        <GradientTextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry
                            showPasswordToggle
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="w-full">
                        <GradientButton
                            title="Sign In"
                            onPress={() => router.push("")} // wire up later
                        />

                    </View>
                </View>
            </View>
        </View>
    );
};

export default HaAlreadySetup;