import { Drawer } from "expo-router/drawer";

import { Pressable, Text, View } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";

import { router } from "expo-router";

import BurgerSearchWidget from "@/components/BurgerSearchWidget";
import TabIcon from "@/components/TabIcon";
import PlusIcon from "@/assets/icons/plus.svg";

function DrawerItem({
                        label,
                        icon,
                        onPress,
                    }: {
    label: string;
    icon: string;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center px-5 py-4"
        >
            <TabIcon name={icon} size={26} />
            <Text className="ml-4 text-base font-poppins">{label}</Text>
        </Pressable>
    );
}

function CustomDrawerContent(props: any) {
    const navigate = (path: string) => {
        props.navigation.closeDrawer();
        router.push(path);
    };

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
                    <TabIcon name="history" size={30} />
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
                    <TabIcon name="automations" size={30} />
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
            screenOptions={({ route }) => ({
                headerShown: true,
                headerTitle:
                    route.name === "automations"
                        ? "Automations"
                        : "",
                headerTransparent: false,
                headerShadowVisible: false,
                headerLeft: () => <BurgerSearchWidget />,

                headerRight: () =>
                    route.name === "automations" ? (
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname: "/automationsEdit",
                                    params: { mode: "create" },
                                })
                            }
                            style={{ paddingRight: 16 }}
                        >
                            <PlusIcon width={22} height={22} />
                        </Pressable>
                    ) : null,
            })}
        >
            {/* Hidden from drawer list but required for routing */}
            <Drawer.Screen
                name="(tabs)"
                options={{ drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="automations"
                options={{ drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="automationsEdit"
                options={{ drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="history"
                options={{ drawerItemStyle: { display: "none" } }}
            />
            <Drawer.Screen
                name="notifications"
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
