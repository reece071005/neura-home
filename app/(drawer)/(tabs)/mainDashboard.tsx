import {Text, View} from "react-native";
import { useRouter } from "expo-router";
import WhiteButton from "@/components/WhiteButton";
import Logo from "@/components/Logo";

const mainDashboard = () => {
    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center">
            <Text className="">
                AI Suggestions
            </Text>
        </View>
    );
}

export default mainDashboard;