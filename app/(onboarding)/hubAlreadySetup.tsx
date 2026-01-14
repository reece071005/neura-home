import { Text, View } from 'react-native'
import { router, Link} from "expo-router";
import React, { useState } from 'react'

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HubSetup = () => {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    return (
        <View className="flex-1">
            <View className="flex-[5] justify-center items-center">
                <View className={"w-5/6"}>
                    <SignInIllustration width="100%" height="100%"/>
                </View>
            </View>
            <View className="flex-[5] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-3">
                    <Text className="text-primaryTo font-bold text-h3 ">
                        Hub 2 is already setup
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please sign in to access this hub
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center gap-10">
                    <View className="w-full gap-6">
                        <GradientTextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            keyboardType="numeric"
                        />
                        <GradientTextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            keyboardType="numeric"
                            secureTextEntry
                            showPasswordToggle
                        />
                    </View>
                    <View className="w-full">
                            <GradientButton
                                title={"Sign In"}
                                onPress={() => router.push("")}
                            />
                        <View className="items-center mt-3">
                            <Text className="text-subtext font-medium">
                                Want to reset your hub?
                            </Text>
                            <Link href={"/(onboarding)/hubAlreadySetup"}> {/*href needs to be updated*/}
                                <Text className="text-primaryTo text-hint font-medium">
                                    Reset here
                                </Text>
                            </Link>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default HubSetup