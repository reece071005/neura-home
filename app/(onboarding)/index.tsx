import {View} from "react-native";
import { useRouter } from "expo-router";
import WhiteButton from "@/components/general/WhiteButton";
import Logo from "@/components/general/Logo";

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
                onPress={()=> router.push("/(onboarding)/hub/hubPrep")}
            />
        </View>
    );
}

