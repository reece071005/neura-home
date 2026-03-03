import React, { useState } from "react";
import { Text, View, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";

import { setOnboardingAccount } from "@/lib/storage/onboardingStore";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";
import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HubNewAccount = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onNext = () => {
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);

    const u = username.trim();
    const e = email.trim();
    const p = password;

    let hasError = false;

    if (!u) {
      setUsernameError("Username is required");
      hasError = true;
    }

    if (!e) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(e)) {
      setEmailError("Enter a valid email address");
      hasError = true;
    }

    if (!p) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (p.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasError = true;
    }

    if (hasError) return;

    // Save to onboarding store — no API call yet
    setOnboardingAccount(u, e, p);
    router.replace("/(onboarding)/haPrep");
  };

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
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          enableOnAndroid
          extraScrollHeight={16}
          extraHeight={Platform.OS === "ios" ? 16 : 120}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="gap-1">
            <Text className="text-primaryTo font-bold text-h3">Set up your hub</Text>
            <Text className="text-textSecondary text-body font-semibold">
              Create an account to link this hub to you
            </Text>
          </View>

          {/* Form */}
          <View className="pt-4">
            <View className="w-full gap-1">
              <GradientTextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                keyboardType="default"
                autoCapitalize="none"
                error={!!usernameError}
                errorText={usernameError}
                returnKeyType="next"
              />

              <GradientTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
                errorText={emailError}
                returnKeyType="next"
              />

              <GradientTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                showPasswordToggle
                autoCapitalize="none"
                error={!!passwordError}
                errorText={passwordError}
                returnKeyType="done"
              />
            </View>

            <View className="w-full mt-4">
              <GradientButton title="Continue" onPress={onNext} />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default HubNewAccount;