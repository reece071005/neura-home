import { Text, View } from 'react-native'
import { router, Link} from "expo-router";
import React, { useState } from 'react'
import {login} from "@/lib/api/auth";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";

import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HubSetup = () => {
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const [loginError, setLoginError] = useState<string | null>(null);
    const [userNameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const onSignIn = async () => {
        setLoginError(null)
        setUsernameError(null)
        setPasswordError(null)

        const u = username.trim()
        const p = password.trim()

        let hasError = false;

        if(!u){
            setUsernameError("Username is required");
            hasError = true;
        }

        if (!p){
            setPasswordError("Password is required");
            hasError = true;
        }

        if (hasError) return;

        try{
            await login(username, password);
            router.replace("/(drawer)/(tabs)/mainDashboard");
        } catch (err: any) {
            console.log(err);
            if (err?.message) {
                setLoginError(err.message);
            } else{
                setLoginError("Login failed. Please try again.")
            }
        }
    }

    return (
        <View className="flex-1">
            <View className="flex-[5] justify-center items-center">
                <View className={"w-5/6"}>
                    <SignInIllustration width="100%" height="100%"/>
                </View>
            </View>
            <View className="flex-[5] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1 mb-5">
                    <Text className="text-primaryTo font-bold text-h3">
                        Hub 1 is already setup
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please sign in to access this hub
                    </Text>
                </View>
                <View className="flex-1 items-center gap-10">
                    <View className="w-full gap-1">
                        <GradientTextInput
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            keyboardType="default"
                            error={!!(loginError || userNameError)}
                            errorText={userNameError}
                        />
                        <GradientTextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            keyboardType="default"
                            secureTextEntry
                            showPasswordToggle
                            error={!!(loginError || passwordError)}
                            errorText={passwordError || loginError }
                        />

                    </View>
                    <View className="w-full">
                            <GradientButton
                                title={"Sign In"}
                                onPress={onSignIn}
                            />
                        <View className="items-center mt-3">
                            <Text className="text-subtext font-medium">
                                Want to reset your hub?
                            </Text>
                            <Link href={"/(drawer)/(tabs)/mainDashboard"}> {/*href needs to be updated*/}
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