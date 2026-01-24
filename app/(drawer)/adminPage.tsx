import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminPage =()  => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4">
                <View className="flex-row justify-center items-center">
                    <Text className="text-2xl font-bold text-black-900">
                        Admin Page
                    </Text>
                </View>

                <View className="w-full items-start mt-4">
                    <Text className="text-lg font-bold text-black-800">
                        Accounts Connected
                    </Text>
                </View>

                {/*Line Divider*/}
                <View className="w-full border-b bg-black-300 mt-2 mb-4" />

                    {/*User 4*/}
                    <View className="flex-row items-center p-4 border-b border-gray-100 border-[0.5px]">
                        <View className="w-10 h-10 bg-gray-100 rounded-full" />
                        <View className="flex-1 ml-4">
                            <Text className="text-base font-bold text-black-900">User 4</Text>
                            <Text className="text-xs text-gray-500">Connected 2 Weeks Ago - 10/11/2025</Text>
                        </View>
                        <View className="w-8 h-8" />
                    </View>


            </ScrollView>
        </SafeAreaView>
    );
}

export default AdminPage;

