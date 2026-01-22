import { Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons} from "@expo/vector-icons"

export default function OnboardingLayout() {
  return (
    <LinearGradient
      colors={["#3DC4E0", "#4985EE"]}
      locations={[0, 0.44]}
      style={{ flex: 1 }}
    >
      <Stack
          screenOptions={{
              contentStyle: {backgroundColor: "transparent"},
              headerTitle: "",
              headerShadowVisible: false,
              headerTransparent: true,
              headerLeft: () => (
                <Pressable onPress={() => router.back()} hitSlop={12}>
                    <MaterialIcons name="arrow-back" size={35} color="white" />
                </Pressable>
            )
      }}
      >
          <Stack.Screen
              name="index"
              options={{
                  headerLeft: () => null,
              }}
          />

          <Stack.Screen name="hubSetup" />
          <Stack.Screen name="hubSearch" />
        </Stack>
    </LinearGradient>
  );
}
