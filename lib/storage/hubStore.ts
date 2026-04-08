//Stores the IP address of the Neura Home Hub
import AsyncStorage from "@react-native-async-storage/async-storage";

let hubBaseUrl: string | null = null;

export const setHubBaseUrl = async (url: string) => {
    hubBaseUrl = url;
    await AsyncStorage.setItem("hubBaseUrl", url);
};

export const getHubBaseUrl = async () => {
    if (hubBaseUrl) return hubBaseUrl;

    const stored = await AsyncStorage.getItem("hubBaseUrl");
    hubBaseUrl = stored;

    return stored;
};

export const clearHubBaseUrl = async () => {
    hubBaseUrl = null;
    await AsyncStorage.removeItem("hubBaseUrl");
};