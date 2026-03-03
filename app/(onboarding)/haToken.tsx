import { Text, View, Platform, Linking } from "react-native";
import { router, Link } from "expo-router";
import React, { useState } from "react";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";
import SignInIllustration from "@/assets/illustrations/signIn.svg";

import { setOnboardingToken, getOnboardingData } from "@/lib/storage/onboardingStore";
import { finalizeOnboarding } from "@/services/finalizeOnboarding";

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

    // Store token locally for now (even though we aren't sending HA details yet)
    setOnboardingToken(t);

    try {
      setSubmitting(true);

      // For now: only register user
      await finalizeOnboarding();

      // Go to your completion screen (or straight to dashboard)
      router.replace("/(onboarding)/setupComplete");

    } catch (e: any) {
      // Best-effort message mapping
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
    <View className="flex-1">
      <View className="flex-[5] justify-center items-center">
        <View className="w-5/6">
          <SignInIllustration width="100%" height="100%" />
        </View>
      </View>

      <View className="flex-[5] bg-white px-6 pt-6 rounded-t-3xl -mt-6">
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          enableOnAndroid
          extraScrollHeight={16}
          extraHeight={Platform.OS === "ios" ? 16 : 120}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <Text className="text-primaryTo font-bold text-h3">
              Connect Home Assistant
            </Text>
            <Text className="text-textSecondary text-body font-semibold">
              Enter a long-lived access token to link your Home Assistant instance.
            </Text>
          </View>

          <View className="mt-4">
            <GradientTextInput
              label="Access Token"
              value={token}
              onChangeText={setToken}
              placeholder="Paste your token here"
              autoCapitalize="none"
              autoCorrect={false}
              error={!!tokenError}
              errorText={tokenError}
              returnKeyType="done"
              multiline
            />
          </View>

          {!!submitError && (
            <Text className="mt-3 text-red-600 font-semibold">
              {submitError}
            </Text>
          )}

          <View className="w-full mt-4">
            <GradientButton
              title={submitting ? "Connecting..." : "Connect"}
              onPress={onContinue}
              disabled={submitting}
            />
          </View>

          <View className="items-center mt-3">
            {/* this should go to your help screen, not dashboard */}
            <Link href={"/(onboarding)/haTokenHelp"}>
              <Text className="text-textSecondary underline">
                How do I get a token?
              </Text>
            </Link>
          </View>

          {/* optional: quick shortcut */}
          <View className="items-center mt-2">
            <Text className="text-textSecondary" onPress={openHAProfile}>
              Open Home Assistant Profile
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default HaLogin;
