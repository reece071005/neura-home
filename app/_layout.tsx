import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { View, ActivityIndicator } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  if(!fontsLoaded){
    return(
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator />
        </View>
    )
  }

  return (
      <Stack screenOptions={{ headerShown: false }} />
  );
}