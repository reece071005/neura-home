import { Tabs } from "expo-router";
import {LinearGradient} from "expo-linear-gradient";
import TabIcon from "@/components/TabIcon"

export default function TabsLayout() {
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
                    sceneStyle: {
                        backgroundColor: "transparent",
                    }
                }}
            >
                <Tabs.Screen
                    name="mainDashboard"
                    options = {{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon name="home" focused={focused}/>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="lightDashboard"
                    options= {{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon  name="light" focused={focused}/>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="voiceAssistant"
                    options= {{
                        tabBarIcon: ({ focused }) => (
                            <TabIcon  name="microphone" focused={focused}/>
                        ),
                    }}
                />
            </Tabs>
        </LinearGradient>
    );
}
