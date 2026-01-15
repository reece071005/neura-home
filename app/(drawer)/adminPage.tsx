import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminPage =()  => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4">
                <View className="flex-row items-center px-6 py-4">
                    <Text className="text-2xl font-bold text-black-900">
                        Admin Page
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default AdminPage;

