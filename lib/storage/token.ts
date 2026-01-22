//imports secure store module.
import * as SecureStore from "expo-secure-store";

const KEY = "access_token";

//Function to save access token in expo secure store
export async function saveToken(token: string) {
    await SecureStore.setItemAsync(KEY, token);
}

//Function that returns the token when used
export async function getToken() {
    return SecureStore.getItemAsync(KEY);
}

//Function that deleted key. Used for logout.
export async function clearToken() {
    await SecureStore.deleteItemAsync(KEY);
}