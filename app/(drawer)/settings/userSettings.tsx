//userSettings.tsx
import React, {useEffect, useState} from "react";
import { Alert, Linking, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { logout } from "@/lib/auth/session";
import { getUserProfile, UserProfile } from "@/lib/api/auth/getUserProfile"

// @ts-ignore
import AccountIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientAccountOutline.svg";
// @ts-ignore
import BrainIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientBrainOutline.svg";
// @ts-ignore
import WebsiteIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientWebsiteOutline.svg";
// @ts-ignore
import ChatIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientChatOutline.svg";
// @ts-ignore
import LogoutIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientLogoutOutline.svg";
// @ts-ignore
import AdminIcon from "../../../assets/illustrations/customMaterialIcons/outline/gradientAdminOutline.svg";

function SettingsItem({title, onPress, Icon,}: {
    title: string;
    onPress?: () => void;
    Icon?: React.ComponentType<{ width?: number; height?: number }>;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    backgroundColor: "white",
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {Icon ? (
                        <View style={{ width: 26, height: 26, marginRight: 12, alignItems: "center", justifyContent: "center" }}>
                            <Icon width={22} height={22} />
                        </View>
                    ) : null}

                    <Text style={{ fontSize: 18, fontWeight: "500" }}>{title}</Text>
                </View>

                <Text style={{ fontSize: 20, color: "#9CA3AF" }}>›</Text>
            </View>

            <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        </TouchableOpacity>
    )}

export default function UserSettings() {
    const [me, setMe] = useState<UserProfile | null>(null);
    const websiteUrl = "https://neurahome.me";
    const helpUrl = "https://neurahome.me/assistant.html";

    const openExternalUrl = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (!supported) {
                Alert.alert("Cannot open website", "Please try again later.");
                return;
            }
            await Linking.openURL(url);
        } catch {
            Alert.alert("Cannot open website", "Please try again later.");
        }
    };

    useEffect(() => {
        let mounted = true;

        getUserProfile()
            .then((p) => {
                if (mounted) setMe(p);
            })
            .catch(console.error);

        return () => {
            mounted = false;
        };
        },[]
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
            <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                <View style={{alignItems: "center", paddingTop: 16, paddingBottom: 16}}>
                    <Text style={{fontSize: 22, fontWeight: "700"}}>Settings</Text>
                </View>

                <View style={{height: 1, backgroundColor: "#E5E7EB"}}></View>
                <SettingsItem title="Account" Icon={AccountIcon} onPress={() => router.push("/settings/account/accountPage")}/>
                <SettingsItem title="AI & Automation" Icon={BrainIcon} onPress={() => router.push("/settings/aiAndAutomation/aiAndAutomation")}/>
                <SettingsItem title="Website" Icon={WebsiteIcon} onPress={() => openExternalUrl(websiteUrl)} />
                <SettingsItem title="Help" Icon={ChatIcon} onPress={() => openExternalUrl(helpUrl)} />
                <SettingsItem title="Logout" Icon={LogoutIcon} onPress={logout}/>

                <View style={{flex: 1}}></View>
            </ScrollView>
                  {me?.role ==="admin" && (
                      <View style={{borderTopWidth: 1, borderTopColor: "#E5E7EB"}}>
                          <SettingsItem title="Admin" Icon={AdminIcon} onPress={() => router.push("/settings/adminPage")}/>
                      </View>
                  )}
        </SafeAreaView>
    );
}
