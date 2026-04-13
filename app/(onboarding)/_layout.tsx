// _layout.tsx
import React from "react";
import { Pressable, View } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function OnboardingLayout() {

  //Handling back button behavior
  const pathname = usePathname();
  const isIndex = pathname === "/";
  const shouldResetHubFlowBack =
    pathname === "/hub/hubSearch" ||
    pathname === "/hub/hubManualAddress" ||
    pathname === "/hub/hubNotFound";
  const shouldRouteHubFoundBackToHubPrep = pathname === "/hub/hubFound";
  const shouldResetHAFlowBack =
    pathname === "/homeAssistant/haSearch" ||
    pathname === "/homeAssistant/haManualAddress" ||
    pathname === "/homeAssistant/haNotFound";

  const handleBack = () => {
    if (shouldRouteHubFoundBackToHubPrep) {
      router.replace("/hub/hubPrep");
      return;
    }
    if (shouldResetHubFlowBack) {
      router.replace("/hub/hubPrep");
      return;
    }
    if (shouldResetHAFlowBack) {
      router.replace("/homeAssistant/haPrep");
      return;
    }

    router.back();
  };

  return (
      // Setting a gradient background & header settings for onboarding screens
      <LinearGradient
          colors={["#3DC4E0", "#4985EE"]}
          locations={[0, 0.44]}
          style={{ flex: 1 }}
      >
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
        {!isIndex && (
            //Custom back button
            <View
                style={{
                  position: "absolute",
                  top: 60,
                  left: 16,
                  zIndex: 50,
                }}
            >
              <Pressable
                  onPress={handleBack}
                  hitSlop={12}
                  android_ripple={{ color: "transparent" }}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.6 : 1,
                    padding: 6,
                  })}
              >
                <MaterialIcons name="arrow-back" size={35} color="white" />
              </Pressable>
            </View>
        )}
      </LinearGradient>
  );
}
