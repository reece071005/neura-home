import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

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
                        router.push("/notifications/notifications");
                    }}
                >
                    <TabIcon name="notifications" size={30} />
                    <Text className="text-textPrimary font-medium text-button pl-4">
                        Notifications
                    </Text>
                </Pressable>

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
                    router.push("/settings/userSettings");
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
                        paddingLeft: isTabsWorld ? 10 : 3,
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
                name="settings/account/uploadFace"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="settings/account/resetPassword"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="settings/aiAndAutomation/createRoom"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="settings/aiAndAutomation/climatePreferences"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="settings/aiAndAutomation/aiPreferences"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
            <Drawer.Screen
                name="notifications/visionNotificationDetail"
                options={{
                    drawerItemStyle: { display: "none" },
                    headerShown: false,
                }}
            />
        </Drawer>
    );
}
