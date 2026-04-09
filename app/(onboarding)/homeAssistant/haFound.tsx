import React from "react";
import { Text, Pressable, View, ScrollView } from "react-native";
import { router } from "expo-router";

import NeuraHubIcon from "@/assets/illustrations/neuraHubIcon.svg";
import { getDiscoveredInstances } from "@/lib/storage/onboardingStore";
import { setOnboardingHA } from "@/lib/storage/onboardingStore";

const HaFound = () => {
  const instances = getDiscoveredInstances();

  return (
    <View className="flex-1">
      <View className="flex-1" />

      <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
        <View className="gap-1">
          <Text className="text-primaryTo text-h3 font-bold">
            Home Assistant found
          </Text>
          <Text className="text-textSecondary text-body font-semibold">
            Select the Home Assistant instance you want to connect to.
          </Text>
        </View>

        <ScrollView
          className="mt-4"
          contentContainerStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {instances.map((ha) => (
            <Pressable
                key={ha.url}
                onPress={() => {
                  setOnboardingHA(ha.name, ha.url);
                  router.push("/homeAssistant/haToken");
                }}
                className="flex-row border-2 border-greyButton rounded-3xl p-3 items-center gap-4"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <NeuraHubIcon width={36} height={36} />
              <View className="flex-1">
                <Text className="font-semibold text-body" numberOfLines={1}>
                  {ha.name}
                </Text>
                <Text className="font-regular text-subtext" numberOfLines={1}>
                  {ha.url}
                </Text>
                <Text className="text-hint text-xs mt-0.5">Ready to sign in</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default HaFound;