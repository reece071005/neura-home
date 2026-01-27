import { View, Text, ScrollView } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";

import AutomationRow from "@/components/AutomationRow";

// USER-DEFINED ICONS
import MorningRoutineIcon from "@/assets/icons/morningRoutine.svg";
import BedtimeRoutineIcon from "@/assets/icons/bedtimeRoutine.svg";
import LeavingHomeIcon from "@/assets/icons/leavingHome.svg";
import ArrivingHomeIcon from "@/assets/icons/arrivingHome.svg";
import CinemaModeIcon from "@/assets/icons/cinemaMode.svg";
import PartyModeIcon from "@/assets/icons/partyMode.svg";

// AI-SUGGESTED ICONS
import BedroomPreCoolIcon from "@/assets/icons/bedroomPreCool.svg";
import WakeupLightCurveIcon from "@/assets/icons/wakeupLightCurve.svg";
import AutoLockFrontDoorIcon from "@/assets/icons/autoLockFrontDoor.svg";

// SECTION ICONS
import UserDefinedIcon from "@/assets/icons/userDefinedAutomations.svg";
import AiSuggestedIcon from "@/assets/icons/aiSuggestedAutomations.svg";

// ACTION ICONS
import EditPenIcon from "@/assets/icons/editPen.svg";
import PlusIcon from "@/assets/icons/plus.svg";

const ICON_SIZE = 22;

export default function AutomationsScreen() {
    const router = useRouter();

    const [enabled, setEnabled] = useState({
        morning: true,
        bedtime: true,
        leaving: true,
        arriving: true,
        cinema: true,
        party: true,
    });

    return (
        <ScrollView className="flex-1 bg-white">
            {/* USER-DEFINED */}
            <View className="mt-4">
                <View className="px-4 flex-row items-center gap-x-3">
                    <UserDefinedIcon width={ICON_SIZE} height={ICON_SIZE} />
                    <Text className="font-poppins font-bold">
                        User-Defined Automations
                    </Text>
                </View>
                <View className="h-px bg-black mt-2 w-full" />
            </View>

            <AutomationRow
                title="Morning Routine"
                Icon={MorningRoutineIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.morning}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, morning: !enabled.morning })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "morning" },
                    })
                }
            />

            <AutomationRow
                title="Bedtime Routine"
                Icon={BedtimeRoutineIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.bedtime}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, bedtime: !enabled.bedtime })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "bedtime" },
                    })
                }
            />

            <AutomationRow
                title="Leaving Home"
                Icon={LeavingHomeIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.leaving}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, leaving: !enabled.leaving })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "leavingHome" },
                    })
                }
            />

            <AutomationRow
                title="Arriving Home"
                Icon={ArrivingHomeIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.arriving}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, arriving: !enabled.arriving })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "arrivingHome" },
                    })
                }
            />

            <AutomationRow
                title="Cinema Mode"
                Icon={CinemaModeIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.cinema}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, cinema: !enabled.cinema })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "cinemaMode" },
                    })
                }
            />

            <AutomationRow
                title="Party Mode"
                Icon={PartyModeIcon}
                EditIcon={EditPenIcon}
                enabled={enabled.party}
                showToggle
                onToggle={() =>
                    setEnabled({ ...enabled, party: !enabled.party })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "partyMode" },
                    })
                }
            />

            {/* AI-SUGGESTED */}
            <View className="mt-8">
                <View className="px-4 flex-row items-center gap-x-3">
                    <AiSuggestedIcon width={ICON_SIZE} height={ICON_SIZE} />
                    <Text className="font-poppins font-bold">
                        AI-Suggested Automations
                    </Text>
                </View>
                <View className="h-px bg-black mt-2 w-full" />
            </View>

            <AutomationRow
                title="Bedroom Pre-Cool"
                Icon={BedroomPreCoolIcon}
                AddIcon={PlusIcon}
                EditIcon={EditPenIcon}
                onAdd={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "create" },
                    })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "bedroomPreCool" },
                    })
                }
            />

            <AutomationRow
                title="Wake-Up Light Curve"
                Icon={WakeupLightCurveIcon}
                AddIcon={PlusIcon}
                EditIcon={EditPenIcon}
                onAdd={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "create" },
                    })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "wakeUpLightCurve" },
                    })
                }
            />

            <AutomationRow
                title="Auto-Lock Front Door"
                Icon={AutoLockFrontDoorIcon}
                AddIcon={PlusIcon}
                EditIcon={EditPenIcon}
                onAdd={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "create" },
                    })
                }
                onEdit={() =>
                    router.push({
                        pathname: "/automationsEdit",
                        params: { mode: "edit", id: "autoLockFrontDoor" },
                    })
                }
            />
        </ScrollView>
    );
}
