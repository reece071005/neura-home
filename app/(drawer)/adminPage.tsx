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

                <View className="w-full border-b bg-black-300 mt-2 mb-4" />
            </ScrollView>
        </SafeAreaView>
    );
}

export default AdminPage;

