import { Text, View } from "react-native";
import { router, Link } from "expo-router";
import React, { useState } from "react";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HubFreshSetup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <View className="flex-1">
            {/* Illustration */}
            <View className="flex-[4.5] justify-center items-center">
                <View className="w-5/6">
                    <SignInIllustration width="100%" height="100%" />
                </View>
            </View>

            {/* Bottom panel */}
            <View className="flex-[5.5] bg-white px-6 pt-6 rounded-t-3xl -mt-6">
                {/* Header */}
                <View className="gap-1">
                    <Text className="text-primaryTo font-bold text-h3">
                        Set up your hub
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Create an account to link this hub to you
                    </Text>
                </View>

                {/* Form placement */}
                <View className="flex-1 justify-end pb-8">
                    <View className="w-full gap-5">
                        <GradientTextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            autoCapitalize="none"
                        />

                        <GradientTextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email"
                            keyboardType="email-address"
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

                    <View className="w-full mt-7">
                        <GradientButton
                            title="Create Account"
                            onPress={() => router.push("")} // hook up later
                        />

                        <View className="items-center mt-3">
                            <Text className="text-subtext font-medium">
                                Already have an account?
                            </Text>

                            <Link href="/(onboarding)/hubAlreadySetup">
                                <Text className="text-primaryTo text-hint font-medium">
                                    Sign in here
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default HubFreshSetup;