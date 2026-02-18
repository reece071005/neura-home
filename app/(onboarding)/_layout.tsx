import React from "react";
import { Pressable, View } from "react-native";
import { Stack, router, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function OnboardingLayout() {
  const pathname = usePathname();
  const isIndex = pathname === "/"; // or adjust if your onboarding base path differs

  return (
    <LinearGradient
      colors={["#3DC4E0", "#4985EE"]}
      locations={[0, 0.44]}
      style={{ flex: 1 }}
    >
      {/* Hide native header completely */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />

      {/* Custom back button overlay (no iOS grey circle) */}
      {!isIndex && (
        <View
          style={{
            position: "absolute",
            top: 60,
            left: 16,
            zIndex: 50,
          }}
        >
          <Pressable
            onPress={() => router.back()}
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
