import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Account_Box from "@/assets/icons/Account_Box.svg";
import Automation from "@/assets/icons/Automation.svg";
import Cancel from "@/assets/icons/Cancel.svg";
import Device_Hub from "@/assets/icons/Device_Hub.svg";
import History from "@/assets/icons/History.svg";
import Routine from "@/assets/icons/Routine.svg";
import Arrow_Left from "@/assets/icons/Arrow_Left.svg";
import Plus_Icon from "@/assets/icons/Plus_Icon.svg";

import {
    useFonts,
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium,
    Poppins_600SemiBold
} from "@expo-google-fonts/poppins";


const AdminPage =()  => {
    const [fontsLoaded] = useFonts({
        'Poppins': Poppins_400Regular,
        'Poppins-Medium': Poppins_500Medium,
        'Poppins-SemiBold': Poppins_600SemiBold,
        'Poppins-Bold': Poppins_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <ScrollView className="flex-1 px-4">
                <View className="w-full flex-row items-center justify-between py-4 mt-2">
                    <View className="w-12 items-start justify-center">
                        <Arrow_Left width={30} height={30} />
                    </View>
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-2xl font-semibold text-black-900">
                            Admin Page
                        </Text>
                    </View>
                    <View className="w-12 items-end justify-center mt-1">
                        <Plus_Icon width={32} height={32} />
                    </View>
                </View>



                {/*Accounts Connected*/}
                <View className="w-full items-start mt-4">
                    <Text className="text-lg font-semibold text-black-800">
                        Accounts Connected
                    </Text>
                </View>

                {/*Line Divider*/}
                <View className="w-full border-b border-black-500 mt-2 mb-4 " />

                {/*User 4*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Account_Box width={30} height={30} />
                    </View>
                    <View className="flex-1 ml-1">
                        <Text className="text-base font-regular text-black-900">User 4</Text>
                        <Text className="text-xs font-regular text-gray-500">Connected 2 Weeks Ago - 10/11/2025</Text>
                    </View>
                    <View className="w-10 h-10 items-end">
                        <Cancel width={28} height={28} />
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*User 3*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Account_Box width={30} height={30} fill="#374151" />
                    </View>
                    <View className="flex-1 ml-1">
                        <Text className="text-base font-regular text-black-900">User 3</Text>
                        <Text className="text-xs font-regular text-gray-500">Connected 3 Weeks Ago - 3/11/2025</Text>
                    </View>
                    <View className="w-10 h-10 items-end">
                        <Cancel width={28} height={28} />
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*User 2*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Account_Box width={30} height={30} fill="#374151" />
                    </View>
                    <View className="flex-1 ml-1">
                        <Text className="text-base font-regular text-black-900">User 2</Text>
                        <Text className="text-xs font-regular text-gray-500">Connected 2 Months Ago - 10/9/2025</Text>
                    </View>
                    <View className="w-10 h-10 items-end">
                        <Cancel width={28} height={28} />
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*User 1*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Account_Box width={30} height={30} fill="#374151" />
                    </View>
                    <View className="flex-1 ml-1">
                        <Text className="text-base font-regular text-black-900">User 1</Text>
                        <Text className="text-xs font-regular text-gray-500">Connected 6 Months Ago - 10/5/2025</Text>
                    </View>
                    <View className="w-10 h-10 items-end">
                        <Cancel width={28} height={28} />
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*Total Overview*/}
                <View className="w-full items-start mt-4">
                    <Text className="text-lg font-semibold text-black-800">
                        Total Overview
                    </Text>
                </View>

                {/*Line Divider*/}
                <View className="w-full border-b bg-black-300 mt-2 mb-4" />

                {/*Total Devices*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Device_Hub width={30} height={30} />
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Total Devices: 32</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*Total Automations*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Automation width={30} height={30} />
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Total Automation: 27</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />

                {/*Total Routines*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <Routine width={30} height={30} />
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">Total Routines: 17</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray mt-2 mb-4" />

                {/*System History*/}
                <View className="flex-row items-start">
                    <View className="w-10 h-10 items-center">
                        <History width={30} height={30} />
                    </View>
                    <View className="flex-1 ml-2 py-2">
                        <Text className="text-base font-regular text-black-900">System History</Text>
                    </View>
                </View>

                <View className="w-full border-[0.5px] bg-gray-200 mt-2 mb-4" />



            </ScrollView>
        </SafeAreaView>
    );
}

export default AdminPage;

