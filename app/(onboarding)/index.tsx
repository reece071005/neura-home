import {Text, View} from "react-native";
import { useRouter } from "expo-router";
import WhiteButton from "@/components/WhiteButton";
import Logo from "@/components/Logo";

export default function Index() {
    const router = useRouter();

    return (
        <View className="flex-1 justify-center items-center">
            <Logo
                color="white"
                shape="square"
                text="with"
                size={300}
            />
            <WhiteButton
                title="Get Started"
                onPress={()=> router.push("/(onboarding)/hubSetup")}
            />
        </View>
    );
}

