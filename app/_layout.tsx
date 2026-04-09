import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect } from "react";
import { View, ActivityIndicator, Alert, Text } from "react-native";

import { requestNotificationPermissions } from "@/services/pushNotifications";
import { useVisionNotificationPoller } from "@/lib/hooks/useVisionNotificationPoller";
import { useConnectionState } from "@/lib/storage/connectionState";

import { setOnSessionExpired } from "@/lib/api/client";
import { clearToken } from "@/lib/storage/token";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import "./globals.css";

export default function RootLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reconnecting = useConnectionState((s) => s.reconnecting);
  useVisionNotificationPoller();

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  // Request notification permissions
  useEffect(() => {
    async function initNotifications() {
      const granted = await requestNotificationPermissions();

      if (!granted) {
        console.warn("Notification permission not granted");
      }
    }

    initNotifications();
  }, []);

  // Handle session expiration globally
  useEffect(() => {
    setOnSessionExpired(async () => {
      await clearToken();

      Alert.alert(
        "Connection lost",
        "Please reconnect to your Neura Hub and log in again."
      );

      router.replace("/");
    });
  }, [router]);

  // Loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }


  return (
      //Global Hub Reconnect Banner
      <SafeAreaProvider>
        {reconnecting && (
            <View
                style={{
                  position: "absolute",
                  top: insets.top + 12,
                  alignSelf: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 999,
                }}
            >
              <ActivityIndicator size="small" color="white" />
              <Text style={{ color: "white", fontWeight: "500" }}>
                Reconnecting…
              </Text>
            </View>
        )}
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
  );
}