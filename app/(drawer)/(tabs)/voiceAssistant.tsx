import {Text, View} from "react-native";
import { useRouter } from "expo-router";
import WhiteButton from "@/components/WhiteButton";
import Logo from "@/components/Logo";
import BurgerSearchWidget from "@/components/BurgerSearchWidget";

const mainDashboard = () => {
    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center">
            <View className="absolute top-safe left-safe pl-3 pt-3 z-50">
                <BurgerSearchWidget size={100}></BurgerSearchWidget>
            </View>

        </View>
    );
}

export default mainDashboard;