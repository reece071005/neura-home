import { Text, View, Platform, Linking, KeyboardAvoidingView, ScrollView } from "react-native";
import { router, Link } from "expo-router";
import React, { useState } from "react";

import { setOnboardingToken, getOnboardingData } from "@/lib/storage/onboardingStore";
import { finalizeOnboarding } from "@/services/finalizeOnboarding";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";
import SignInIllustration from "@/assets/illustrations/signIn.svg";

const HaLogin = () => {
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { haUrl } = getOnboardingData();

  const onContinue = async () => {
    setTokenError(null);
    setSubmitError(null);

    const t = token.trim();

    if (!t) {
      setTokenError("Access token is required");
      return;
    }
    if (t.length < 20) {
      setTokenError("This doesn't look like a valid token");
      return;
    }

    setOnboardingToken(t);

    try {
      setSubmitting(true);
      await finalizeOnboarding();
      router.replace("/homeAssistant/setupComplete");
    } catch (e: any) {
      const msg =
        typeof e?.message === "string"
          ? e.message
          : "Couldn't complete registration. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openHAProfile = () => {
    const base = haUrl ?? "http://homeassistant.local:8123";
    Linking.openURL(`${base}/profile`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        <View className="flex-[2] justify-center items-center">
          <View className="w-5/6">
            <SignInIllustration width="100%" height="100%" />
          </View>
        </View>

        <View className="bg-white px-6 pt-6 rounded-t-3xl -mt-6 pb-10">
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <View className="gap-1">
              <Text className="text-primaryTo font-bold text-h3">
                Connect Home Assistant
              </Text>
              <Text className="text-textSecondary text-body font-semibold">
                Enter a long-lived access token to link your Home Assistant instance.
              </Text>
            </View>

            <View className="items-center gap-2 mt-10">
              <GradientTextInput
                  label="Access Token"
                  value={token}
                  onChangeText={(value) => {
                    setToken(value);
                    if (tokenError) setTokenError(null);
                  }}
                  placeholder="Paste your token here"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={!!tokenError}
                  errorText={tokenError}
                  multiline
              />

              {!!submitError && (
                  <Text className="text-red-600 font-semibold">
                    {submitError}
                  </Text>
              )}

              <GradientButton
                  title={submitting ? "Connecting..." : "Connect"}
                  onPress={onContinue}
                  disabled={submitting}
              />

              <View className="items-center">
                <Link href={"https://www.home-assistant.io/docs/authentication/"}>
                  <Text className="text-textSecondary text-hint font-semibold">
                    How do I get a token?
                  </Text>
                </Link>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HaLogin;