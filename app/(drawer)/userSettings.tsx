import React, {useEffect, useState} from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { logout } from "@/lib/auth/session";
import { getUserProfile, UserProfile } from "@/lib/api/auth/getUserProfile"

// @ts-ignore
import AccountIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientAccountOutline.svg";
// @ts-ignore
import BrainIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientBrainOutline.svg";
// @ts-ignore
import SecurityIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientSecurityOutline.svg";
// @ts-ignore
import PrivacyIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientPrivacyOutline.svg";
// @ts-ignore
import Terms_Conditions_Icon from "../../assets/illustrations/customMaterialIcons/outline/gradientTermsConditionsOutline.svg";
// @ts-ignore
import ContactIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientContactOutline.svg";
// @ts-ignore
import FeedbackIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientFeedbackOutline.svg";
// @ts-ignore
import LogoutIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientLogoutOutline.svg";
// @ts-ignore
import AdminIcon from "../../assets/illustrations/customMaterialIcons/outline/gradientAdminOutline.svg";

function SettingsItem({
      title,
      onPress,
      Icon,
      }: {
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
                <SettingsItem title="Account" Icon={AccountIcon} onPress={() => router.push("/(drawer)/accountPage")}/>
                <SettingsItem title="AI & Automation" Icon={BrainIcon} onPress={() => router.push("/(drawer)/accountPage")}/>
                <SettingsItem title="Security" Icon={SecurityIcon}/>
                <SettingsItem title="Privacy" Icon={PrivacyIcon}/>
                <SettingsItem title="Terms and Conditions" Icon={Terms_Conditions_Icon}/>
                <SettingsItem title="Contact" Icon={ContactIcon}/>
                <SettingsItem title="Feedback" Icon={FeedbackIcon}/>
                <SettingsItem title="Logout" Icon={LogoutIcon} onPress={logout}/>

                <View style={{flex: 1}}></View>
            </ScrollView>
                  {me?.role ==="admin" && (
                      <View style={{borderTopWidth: 1, borderTopColor: "#E5E7EB"}}>
                          <SettingsItem title="Admin" Icon={AdminIcon} onPress={() => router.push("/(drawer)/adminPage")}/>
                      </View>
                  )}
        </SafeAreaView>
    );
}

