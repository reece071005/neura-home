import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import AccountIcon from "../../assets/logo/svg/Account_Icon.svg";
// @ts-ignore
import SecurityIcon from "../../assets/logo/svg/Security_Icon.svg";
// @ts-ignore
import PrivacyIcon from "../../assets/logo/svg/Privacy_Icon.svg";
// @ts-ignore
import Terms_Conditions_Icon from "../../assets/logo/svg/Terms_Conditions_Icon.svg";
// @ts-ignore
import ContactIcon from "../../assets/logo/svg/Contact_Icon.svg";
// @ts-ignore
import FeedbackIcon from "../../assets/logo/svg/Feedback_Icon.svg";
// @ts-ignore
import LogoutIcon from "../../assets/logo/svg/Logout_Icon.svg";
// @ts-ignore
import AdminIcon from "../../assets/logo/svg/Admin_Icon.svg";
import React from "react";


export default function UserSettings() {
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
            <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
                <View style={{alignItems: "center", paddingTop: 16, paddingBottom: 16}}>
                    <Text style={{fontSize: 22, fontWeight: "700"}}>Settings</Text>
                </View>

                <View style={{height: 1, backgroundColor: "#E5E7EB"}}></View>
                <SettingsItem title="Account" Icon={AccountIcon}/>
                <SettingsItem title="Security" Icon={SecurityIcon}/>
                <SettingsItem title="Privacy" Icon={PrivacyIcon}/>
                <SettingsItem title="Terms and Conditions" Icon={Terms_Conditions_Icon}/>
                <SettingsItem title="Contact" Icon={ContactIcon}/>
                <SettingsItem title="Feedback" Icon={FeedbackIcon}/>
                <SettingsItem title="Logout" Icon={LogoutIcon}/>

                <View style={{flex: 1}}></View>
            </ScrollView>

            <View style={{borderTopWidth: 1, borderTopColor: "#E5E7EB"}}>
                <SettingsItem title="Admin" Icon={AdminIcon}/>
            </View>
        </SafeAreaView>

    );
}

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
