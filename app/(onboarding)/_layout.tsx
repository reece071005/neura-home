import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function OnboardingLayout() {
  return (
    <LinearGradient
      colors={["#3DC4E0", "#4985EE"]}
      locations={[0, 0.44]}
      style={{ flex: 1 }}
    >
      <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {backgroundColor: "transparent"},
      }}
      />
    </LinearGradient>
  );
}
