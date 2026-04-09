import { Text, View, Platform, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";

import GradientButton from "@/components/GradientButton";
import GradientTextInput from "@/components/GradientTextInput";
import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HubSetup = () => {
  const [ip, setIp] = useState("");
  const [ipError, setIpError] = useState<string | null>(null);

  const isValidIpv4 = (value: string) => {
    const parts = value.split(".");
    if (parts.length !== 4) return false;

    for (const part of parts) {
      if (!/^\d{1,3}$/.test(part)) return false;
      const n = Number(part);
      if (n < 0 || n > 255) return false;
    }

    return true;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <View className="flex-1">
        <View className="flex-[2] justify-center items-center">
          <View className="w-5/6">
            <HubSetupIllustration width="100%" height="100%" />
          </View>
        </View>

        <View className="bg-white px-6 pt-6 rounded-t-3xl -mt-6 pb-10">
          <View className="gap-1">
            <Text className="text-primaryTo font-bold text-h3">
              Manual address
            </Text>

            <Text className="text-textSecondary text-body font-semibold">
              If your device was not detected, you can enter the IP address of your hub
            </Text>
          </View>

          <View className="items-center gap-10 mt-10">
            <GradientTextInput
              value={ip}
              onChangeText={(value) => {
                setIp(value);
                if (ipError) setIpError(null);
              }}
              placeholder="e.g. 192.168.1.100"
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              error={!!ipError}
              errorText={ipError}
            />

            <GradientButton
              title="Submit"
              onPress={() => {
                const cleanedIp = ip.trim();

                if (!cleanedIp) {
                  setIpError("IP address is required");
                  return;
                }

                if (!isValidIpv4(cleanedIp)) {
                  setIpError("Enter a valid IP address (x.x.x.x)");
                  return;
                }

                router.replace({
                  pathname: "/hub/hubSearch",
                  params: { manualIp: cleanedIp }
                });
              }}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HubSetup;
