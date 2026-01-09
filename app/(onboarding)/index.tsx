import {Text, View} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Link} from "expo-router"

export default function Index() {
    return (
        <View className="flex-1 justify-center items-center">
            <Text className="text-5xl text-white font-bold align-middle">
                Welcome!
            </Text>
            <Link href="/(onboarding)/hubSetup">Get Started</Link>
        </View>
    );
}

