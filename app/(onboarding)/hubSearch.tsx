import {Image, Text, View} from 'react-native';
import {Link, router, useLocalSearchParams } from "expo-router"
import React, { useEffect, useRef } from 'react';

import Spinner from "@/components/Spinner";

import {startHubDiscovery, checkHubAddress} from "@/services/hubDiscovery";


const HubSearch = () => {
    const navigated = useRef(false);
    const { manualIp } = useLocalSearchParams();

    useEffect(() => {

      const minDisplayTime = 1200;
      const startTime = Date.now();

      const finish = (callback: () => void) => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(callback, remaining);
      };

      // If manual IP provided
      if (manualIp) {

        const checkManual = async () => {

          const hub = await checkHubAddress(String(manualIp));

          if (hub) {
            finish(() => {
              router.replace({
                pathname: "/(onboarding)/hubFound",
                params: { id: hub.id, name: hub.name, ip: hub.ip }
              });
            });
          } else {
            finish(() => {
              router.replace("/(onboarding)/hubNotFound");
            });
          }

        };

        checkManual();
        return;

      }

      // Normal discovery
      const stop = startHubDiscovery({
        timeoutMs: 6000,

        onFound: (hub) => {
          finish(() => {
            router.replace({
              pathname: "/(onboarding)/hubFound",
              params: { id: hub.id, name: hub.name, ip: hub.ip }
            });
          });
        },

        onTimeout: () => {
          finish(() => {
            router.replace("/(onboarding)/hubNotFound");
          });
        }
      });

      return stop;

    }, []);

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
                                source={require("../../assets/logo/png/logoGradientSquareNoText.png")}
                                style={{width:120, height:120}}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                    <Link href="/(onboarding)/hubManualAddress" className="mt-36">
                        <Text className="text-textSecondary text-body font-semibold">
                            Add address manually
                        </Text>
                    </Link>
                </View>
            </View>
        </View>
    )
}
export default HubSearch
