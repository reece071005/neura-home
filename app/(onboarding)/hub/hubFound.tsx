import React, { useEffect, useState } from "react";
import { Text, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { setHubBaseUrl } from "@/lib/storage/hubStore";
import {getHomeAssistantConfig} from "@/lib/api/hub/homeAssistant";

import NeuraHubIcon from "@/assets/illustrations/neuraHubIcon.svg";

const HubFound = () => {
    const { id, name, ip } = useLocalSearchParams();

    const [configured, setConfigured] = useState<boolean | null>(null);

    useEffect(() => {
      const checkHub = async () => {
        try {
          const data = await getHomeAssistantConfig();

          setConfigured(!!data?.url);

        } catch (err: any) {

          const message = String(err?.message ?? "");

          // If backend says authentication required
          // it means HA IS already configured
          if (message.toLowerCase().includes("authentication required")) {
            setConfigured(true);
            return;
          }

          // Otherwise assume not configured
          setConfigured(false);
        }
      };

      checkHub();
    }, []);

    const handlePress = async () => {
        await setHubBaseUrl(ip);

        if (configured) {
            router.push("/hub/hubLogin");
        } else {
            router.push({
                pathname: "/hub/hubNewAccount",
                params: { id, name, ip }
            });
        }
    };

    return (
        <View className="flex-1">

            <View className="flex-1" />

            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Hub found
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Please select the Neura Home hub you want to connect to.
                    </Text>
                </View>

                <View className="mt-4 gap-4">

                    <Pressable
                        onPress={handlePress}
                        className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                    >
                        <NeuraHubIcon width={36} height={36} />

                        <View>
                            <Text className="font-semibold text-body">
                                {name}
                            </Text>

                            <Text className="font-regular text-subtext">
                                {ip}
                            </Text>

                            <Text className="text-hint text-xs mt-0.5">
                                {configured === null
                                    ? "Checking hub..."
                                    : configured
                                        ? "Already set up"
                                        : "Not set up"}
                            </Text>
                        </View>

                    </Pressable>

                </View>
            </View>
        </View>
    );
};

export default HubFound;