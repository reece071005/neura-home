import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AdminPage =()  => {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-4">
                <View className="py-4">
                    {/*content goes here*/}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default AdminPage;

