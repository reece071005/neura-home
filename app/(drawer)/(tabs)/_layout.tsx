import { Tabs } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MdiIcon from "@/components/MdiIcon";
import { useDashboardWidgetsStore } from "@/lib/storage/dashboardWidgetStore";
import { useHydrateDashboardsFromDb } from "@/lib/hooks/useHydrateDashboardsFromDb";


import {
    mdiMicrophone,
    mdiPencil,
    mdiViewDashboard,
} from "@mdi/js";

export default function TabsLayout() {
    useHydrateDashboardsFromDb();
    const hasHydrated = useDashboardWidgetsStore((s) => s.hasHydrated);

    if (!hasHydrated) {
        return (
            <LinearGradient colors={["#3DC4E0", "#4985EE"]} locations={[0, 0.44]} style={{ flex: 1 }}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#111827" />
                </View>
            </LinearGradient>
        );

    }

    const dashboards = useDashboardWidgetsStore((s) => s.dashboards);

    const d0 = dashboards[0];
    const d1 = dashboards[1];
    const d2 = dashboards[2];

    const dashTabOptions = (d?: { name: string; iconPath?: string }) => ({

        href: hasHydrated && !d ? null : undefined,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
            <MdiIcon
                path={d?.iconPath ?? mdiViewDashboard}
                size={24}
                color={focused ? "#111827" : "#9CA3AF"}
            />
        ),
    });

    return (
        <LinearGradient
            colors={["#3DC4E0", "#4985EE"]}
            locations={[0, 0.44]}
            style={{ flex: 1 }}
        >
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    sceneStyle: { backgroundColor: "transparent" },
                }}
            >
                {/* Hide shared renderer route from tab bar */}
                <Tabs.Screen name="shared/DashboardScreen" options={{ href: null }} />

                {/* Dashboard slots (dynamic show/hide) */}
                <Tabs.Screen name="dash0" options={dashTabOptions(d0)} />
                <Tabs.Screen name="dash1" options={dashTabOptions(d1)} />
                <Tabs.Screen name="dash2" options={dashTabOptions(d2)} />

                {/* Always present */}
                <Tabs.Screen
                    name="voiceAssistant"
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <MdiIcon
                                path={mdiMicrophone}
                                size={24}
                                color={focused ? "#111827" : "#9CA3AF"}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="dashboardEdit"
                    options={{
                        headerShown: false,
                        tabBarStyle: {display: "none"},
                        unmountOnBlur: true,
                        tabBarIcon: ({ focused }) => (
                            <MdiIcon
                                path={mdiPencil}
                                size={24}
                                color={focused ? "#111827" : "#9CA3AF"}
                            />
                        ),
                    }}
                />
            </Tabs>
        </LinearGradient>
    );
}
