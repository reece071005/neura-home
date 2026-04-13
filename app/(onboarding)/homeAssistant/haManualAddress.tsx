import { Text, View, Platform, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";

import GradientButton from "@/components/general/GradientButton";
import GradientTextInput from "@/components/general/GradientTextInput";
import HubSetupIllustration from "@/assets/illustrations/manualIP.svg";

const HaManualAddress = () => {
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  const isValidIpv4 = (value: string) => {
    // Accept valid IPv4
    const parts = value.split(".");
    if (parts.length === 4) {
      return parts.every((part) => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const n = Number(part);
        return n >= 0 && n <= 255;
      });
    }
    return false;
  };

  const normalizeHaAddress = (value: string): string | null => {
    if (isValidIpv4(value)) {
      return `http://${value}:8123`;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      return url.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        {/* Illustration */}
        <View className="flex-[2] justify-center items-center">
          <View className="w-5/6">
            <HubSetupIllustration width="100%" height="100%" />
          </View>
        </View>

        {/* Bottom card */}
        <View className="bg-white px-6 pt-6 rounded-t-3xl -mt-6 pb-10">
          <View className="gap-1">
            <Text className="text-primaryTo font-bold text-h3">
              Manual address
            </Text>
            <Text className="text-textSecondary text-body font-semibold">
              If Home Assistant was not detected automatically, enter its address below.
            </Text>
          </View>

          <View className="items-center gap-10 mt-10">
            <GradientTextInput
              value={address}
              onChangeText={(value) => {
                setAddress(value);
                if (addressError) setAddressError(null);
              }}
              placeholder="e.g. http://homeassistant.local:8123"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
              error={!!addressError}
              errorText={addressError}
            />

            <GradientButton
              title="Submit"
              onPress={() => {
                const cleanedAddress = address.trim();

                if (!cleanedAddress) {
                  setAddressError("Address is required");
                  return;
                }

                const normalizedAddress = normalizeHaAddress(cleanedAddress);
                if (!normalizedAddress) {
                  setAddressError(
                    "Enter a valid address (e.g. http://homeassistant.local:8123)"
                  );
                  return;
                }

                router.replace({
                  pathname: "/homeAssistant/haSearch",
                  params: { manualAddress: normalizedAddress },
                });
              }}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HaManualAddress;
