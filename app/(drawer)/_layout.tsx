import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { sendLocalNotification } from "@/services/pushNotifications";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";
import BurgerWidget from "@/components/BurgerWidget";

import TabIcon from "@/components/TabIcon";

function CustomDrawerContent(props: any) {
    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flexGrow: 1}}
        >
            <View className="gap-y-5">
                <Pressable
                    className="flex-row items-center text-center"
                    onPress={() => {
                        props.navigation.closeDrawer();
                        router.push("/(drawer)/(tabs)/dash0");
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
                        sendLocalNotification("Motion Detected", "Living room camera triggered")
                        //router.push("/(drawer)/(tabs)/mainDashboard");
                    }}
                >
                    <TabIcon name="history" size={30} />
                    <Text className="text-textPrimary font-medium text-button pl-4">
                        History
                    </Text>
                </Pressable>

                <Pressable
                    className="flex-row items-center text-center"
                    onPress={() => {
                        props.navigation.closeDrawer();
                        router.push("/(drawer)/automations");
                    }}
                >
                    <TabIcon name="automations" size={30} />
                    <Text className="text-textPrimary font-medium text-button pl-4">
                        Automations
                    </Text>
                </Pressable>

                <Pressable
                    className="flex-row items-center text-center"
                    onPress={() => {
                        props.navigation.closeDrawer();
                        router.push("/(drawer)/notifications");
                    }}
                >
                    <TabIcon name="notifications" size={30} />
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
                    <TabIcon name="devices" size={30} />
                    <Text className="text-textPrimary font-medium text-button pl-4">
                        Devices
                    </Text>
                </Pressable>
            </View>
            <View className="mt-auto pb-2">
            <Pressable
                className="flex-row items-center text-center"
                onPress={() => {
                    props.navigation.closeDrawer();
                    router.push("/(drawer)/userSettings");
                }}
            >
                <TabIcon name="settings" size={30} />
                <Text className="text-textPrimary font-medium text-button pl-4">
                    Settings
                </Text>
            </Pressable>
            </View>
        </DrawerContentScrollView>
    );
}

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions= {({ route }) => {
                const isTabsWorld = route.name === "(tabs)";
                const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? "dash0";
                const isDashboardEdit = isTabsWorld && focusedRouteName === "dashboardEdit";

                return {
                    headerShown: !isDashboardEdit,
                    drawerType: "front",
                    headerTransparent: true,
                    headerTitle: "",
                    headerShadowVisible: false,

                    headerLeft: () => (
                        isTabsWorld ? <BurgerWidget/> : <BurgerWidget/>
                    ),
                    headerLeftContainerStyle: {
                        paddingLeft: isTabsWorld ? 10 : 3,   // 👈 different per world
                    },
                }
            }}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{ drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="automationsEdit"
                  options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                  }}
            />

            <Drawer.Screen
                name="uploadFace"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="resetPassword"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="createRoom"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
        </Drawer>
    );
}
