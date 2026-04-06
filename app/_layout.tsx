import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { requestNotificationPermissions } from "@/services/pushNotifications";
import { useVisionNotificationPoller } from "@/lib/hooks/useVisionNotificationPoller";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import { setOnSessionExpired } from "@/lib/api/client";
import { clearToken } from "@/lib/storage/token";

import "./globals.css";

export default function RootLayout() {
  const router = useRouter();

  useVisionNotificationPoller();

  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  useEffect(() => {
    async function initNotifications() {
      const granted = await requestNotificationPermissions();
      if (!granted) console.warn("Notification permission not granted");
    }
    initNotifications();
  }, []);

  useEffect(() => {
    setOnSessionExpired(async () => {
      await clearToken();
      Alert.alert("Session timed out", "Please log in again.");
      router.replace("/");
    });
  }, [router]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}