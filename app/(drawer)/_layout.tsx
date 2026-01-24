import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Text, Pressable } from "react-native";
import { router } from "expo-router";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";
import TabIcon from "@/components/TabIcon";

function CustomDrawerContent(props: any) {
    return (
        <DrawerContentScrollView {...props}>
            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/(tabs)/mainDashboard");
                }}
            >
                <TabIcon name="home" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    Dashboards
                </Text>
            </Pressable>

            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/(tabs)/mainDashboard");
                }}
            >
                <TabIcon name="home" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    History
                </Text>
            </Pressable>

            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/(tabs)/mainDashboard");
                }}
            >
                <TabIcon name="home" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    Automations
                </Text>
            </Pressable>

            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/(tabs)/mainDashboard");
                }}
            >
                <TabIcon name="home" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    Notifications
                </Text>
            </Pressable>

            {/* ✅ Devices routes into its own stack */}
            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/devices");
                }}
            >
                <TabIcon name="home" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    Devices
                </Text>
            </Pressable>
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
                drawerType: "front",
                headerTransparent: true,
                headerTitle: "",
                headerShadowVisible: false,
                headerLeft: () => <BurgerSearchWidget />,
                headerLeftContainerStyle: { paddingLeft: 10 },
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{ drawerItemStyle: { display: "none" } }}
            />

            {/* ✅ IMPORTANT: hide Drawer header so Devices Stack controls back correctly */}
            <Drawer.Screen
                name="devices"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
        </Drawer>
    );
}
