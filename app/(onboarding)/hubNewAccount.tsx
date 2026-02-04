import React, { useState } from "react";
import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { register } from "@/lib/api/auth";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";
import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HubNewAccount = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerError, setRegisterError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onRegister = async () => {
    setRegisterError(null);
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

    try {
      await register(e, u, p);
      router.replace("/(onboarding)/haPrep");
    } catch (err: any) {
      const msg =
        typeof err?.message === "string"
          ? err.message
          : "Register failed. Please try again.";

      const lower = msg.toLowerCase();

      if (
        lower.includes("email") &&
        (lower.includes("exists") || lower.includes("already") || lower.includes("taken"))
      ) {
        setEmailError(msg);
        return;
      }

      if (
        lower.includes("username") &&
        (lower.includes("exists") || lower.includes("already") || lower.includes("taken"))
      ) {
        setUsernameError(msg);
        return;
      }

      if (lower.includes("password")) {
        setPasswordError(msg);
        return;
      }

      setRegisterError(msg);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View className="flex-1">
        {/* Illustration */}
        <View className="flex-[4.5] justify-center items-center">
          <View className="w-5/6">
            <SignInIllustration width="100%" height="100%" />
          </View>
        </View>

        {/* Bottom panel */}
        <View className="flex-[5.5] bg-white px-6 pt-6 rounded-t-3xl -mt-6">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Header */}
            <View className="gap-1">
              <Text className="text-primaryTo font-bold text-h3">Set up your hub</Text>
              <Text className="text-textSecondary text-body font-semibold">
                Create an account to link this hub to you
              </Text>

              {registerError ? (
                <Text className="text-red-500 font-medium mt-2">{registerError}</Text>
              ) : null}
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
                  error={!!(registerError || usernameError)}
                  errorText={usernameError}
                />

                <GradientTextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!(registerError || emailError)}
                  errorText={emailError}
                />

                <GradientTextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  keyboardType="default"
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  error={!!(registerError || passwordError)}
                  errorText={passwordError || registerError}
                />
              </View>

              <View className="w-full mt-4">
                <GradientButton title="Create Account" onPress={onRegister} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HubNewAccount;
