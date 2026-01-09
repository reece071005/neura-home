import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
    return (
        <LinearGradient
            colors={["#3DC4E0", "#4985EE"]} // indigo-400 → blue-600
            locations={[0, 0.44]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <Text className="text-5xl text-white font-bold">
                Welcome!
            </Text>
        </LinearGradient>
    );
}