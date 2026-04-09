// app/(onboarding)/setupComplete.tsx
import React from "react";
import { View, Text} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import GradientButton from "@/components/GradientButton";

import SetupCompleteIllustration from "@/assets/illustrations/setupComplete.svg";

export default function SetupComplete() {
  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="flex-1">
        {/* Top illustration area */}
        <View className="flex-[5] justify-center items-center px-6">
          <View className="w-full max-w-[420px] items-center">
                <SetupCompleteIllustration width="100%" height="100%" />
          </View>
        </View>

        {/* Bottom panel */}
        <View className="flex-[5] bg-white px-6 pt-7 rounded-t-3xl -mt-6">
          <View className="gap-2">
            <Text className="text-primaryTo font-bold text-h2">
              Setup complete
            </Text>

            <Text className="text-textSecondary text-body font-semibold">
              Your Neura Home account is ready. You can start using the dashboard now.
            </Text>
          </View>

          {/* Success card */}
          <View className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
            <Text className="text-primaryTo font-bold text-body">
              What’s next
            </Text>

            <View className="mt-2 gap-2">
              <Text className="text-textSecondary text-body">
                • Open your dashboard and add devices
              </Text>
              <Text className="text-textSecondary text-body">
                • Connect Home Assistant anytime from Settings
              </Text>
              <Text className="text-textSecondary text-body">
                • Enable AI per room when you’re ready
              </Text>
            </View>
          </View>

          {/* Button */}
          <View className="mt-6 gap-3">
            <GradientButton title="Sign In" onPress={() => router.replace("/")} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
