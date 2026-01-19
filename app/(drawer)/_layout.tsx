import { Drawer } from "expo-router/drawer";
import {Platform} from "react-native";
import BurgerSearchWidget from "@/components/BurgerSearchWidget";

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: true,
                drawerType: "front",

                headerTransparent: true,
                headerTitle: "",
                headerShadowVisible: false,

                headerLeft: () => <BurgerSearchWidget />,
                headerLeftContainerStyle: {paddingLeft: 10},
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{ drawerItemStyle: {display: "none"}}}
            />
        </Drawer>
    );
}
