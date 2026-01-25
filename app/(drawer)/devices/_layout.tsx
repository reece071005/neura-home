import React from "react";
import { Stack } from "expo-router";

export default function DevicesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitleAlign: "center",
                headerShadowVisible: false,
                headerTransparent: false,
            }}
        />
    );
}
