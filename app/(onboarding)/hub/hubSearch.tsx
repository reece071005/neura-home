//hubSearch.tsx
import {Image, Pressable, Text, View} from 'react-native';
import {router, useFocusEffect, useLocalSearchParams } from "expo-router"
import React, { useCallback, useRef } from 'react';

import Spinner from "@/components/general/Spinner";

import {startHubDiscovery, checkHubAddress} from "@/services/hubDiscovery";


const HubSearch = () => {
    const navigated = useRef(false);
    const { manualIp } = useLocalSearchParams();

    useFocusEffect(
      useCallback(() => {
      navigated.current = false;
      let isActive = true;
      let finishTimer: ReturnType<typeof setTimeout> | null = null;
      let stopDiscovery: (() => void) | undefined;
      const manualIpValue = Array.isArray(manualIp) ? manualIp[0] : manualIp;

      const minDisplayTime = 1200;
      const startTime = Date.now();

      const clearFinishTimer = () => {
        if (!finishTimer) return;
        clearTimeout(finishTimer);
        finishTimer = null;
      };

      const safeReplace = (target: Parameters<typeof router.replace>[0]) => {
        if (!isActive || navigated.current) return;
        navigated.current = true;
        router.replace(target);
      };

      const finish = (callback: () => void) => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        clearFinishTimer();
        finishTimer = setTimeout(() => {
          if (!isActive || navigated.current) return;
          callback();
        }, remaining);
      };

      if (manualIpValue) {
        const checkManual = async () => {

          const hub = await checkHubAddress(String(manualIpValue));
          if (!isActive) return;

          if (hub) {
            finish(() => {
              safeReplace({
                pathname: "/hub/hubFound",
                params: { id: hub.id, name: hub.name, ip: hub.ip }
              });
            });
          } else {
            finish(() => {
              safeReplace("/hub/hubNotFound");
            });
          }

        };

        checkManual();
        return () => {
          isActive = false;
          clearFinishTimer();
        };

      }

      // Normal discovery
      stopDiscovery = startHubDiscovery({
        timeoutMs: 6000,

        onFound: (hub) => {
          finish(() => {
            safeReplace({
              pathname: "/hub/hubFound",
              params: { id: hub.id, name: hub.name, ip: hub.ip }
            });
          });
        },

        onTimeout: () => {
          finish(() => {
            safeReplace("/hub/hubNotFound");
          });
        }
      });

      return () => {
        isActive = false;
        clearFinishTimer();
        stopDiscovery?.();
      };

    }, [manualIp])
    );

    return (
        <View className="flex-1">
            <View className="flex-1"></View>
            <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
                <View className="gap-1">
                    <Text className="text-primaryTo text-h3 font-bold">
                        Searching for your hub
                    </Text>
                    <Text className="text-textSecondary text-body font-semibold">
                        Neura Home is searching for your hub this may take a few minutes
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center">
                    <View className="relative items-center justify-center" style={{width:260, height:260}}>
                        <Spinner size={260}></Spinner>
                        <View
                            className="absolute inset-0 items-center justify-center"
                            style={{ top: 0, bottom: 0, left: 0, right: 0, transform: [{ translateY: -4 }] }}
                        >
                            <Image
                                source={require("../../../assets/logo/png/logoGradientSquareNoText.png")}
                                style={{width:120, height:120}}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Pressable className="mt-36" onPress={() => router.replace("/hub/hubManualAddress")}>
                        <Text className="text-textSecondary text-body font-semibold">
                            Add address manually
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}
export default HubSearch
