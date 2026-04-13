import { Image, Pressable, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef } from "react";
import Zeroconf from "react-native-zeroconf";

import Spinner from "@/components/general/Spinner";
import { DiscoveredHA, setDiscoveredInstances } from "@/lib/storage/onboardingStore";

const SCAN_TIMEOUT_MS = 8000;

const HaSearch = () => {
  const navigated = useRef(false);
  const { manualAddress } = useLocalSearchParams<{ manualAddress?: string | string[] }>();

  useFocusEffect(
      useCallback(() => {
        navigated.current = false;
        const manualAddressValue = Array.isArray(manualAddress)
            ? manualAddress[0]
            : manualAddress;

        const finish = (instances: DiscoveredHA[]) => {
          if (navigated.current) return;
          navigated.current = true;
          setDiscoveredInstances(instances);

          if (instances.length > 0) {
            router.replace("/homeAssistant/haFound");
          } else {
            router.replace("/homeAssistant/haNotFound");
          }
        };

        if (manualAddressValue) {
          let isActive = true;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

          const checkManualAddress = async () => {
            try {
             const res = await fetch(`${manualAddressValue}/api/`, {
               method: "GET",
               signal: controller.signal,
              });

             if (!isActive) return;


             const reachable = res.status === 200 || res.status === 401;
             if (!reachable) {
               finish([]);
               return;
             }

             const parsed = new URL(manualAddressValue);
             const instance: DiscoveredHA = {
               name: "Home Assistant",
               host: parsed.hostname,
                port: Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80)),
                url: manualAddressValue,
              };

              finish([instance]);
            } catch {
              if (!isActive) return;
              finish([]);
            }
          };

          checkManualAddress();

          return () => {
            isActive = false;
            clearTimeout(timeoutId);
            controller.abort();
          };
        }

        const zeroconf = new Zeroconf();
        const found: DiscoveredHA[] = [];
        let stopped = false;
        let isActive = true;

        const stop = () => {
          if (stopped) return;
          stopped = true;
          zeroconf.stop();
          zeroconf.removeDeviceListeners();
        };

        const finishDiscovery = (instances: DiscoveredHA[]) => {
          if (!isActive || navigated.current) return;
          navigated.current = true;
          stop();
          setDiscoveredInstances(instances);

          if (instances.length > 0) {
            router.replace("/homeAssistant/haFound");
          } else {
            router.replace("/homeAssistant/haNotFound");
          }
        };

        zeroconf.on("resolved", (service) => {
          if (!isActive || stopped) return;
          const host = service.addresses?.[0];
          if (!host) return;

          const port = service.port ?? 8123;
          const entry: DiscoveredHA = {
            name: service.txt?.friendly_name ?? service.name ?? "Home Assistant",
            host,
            port,
            url: `http://${host}:${port}`,
          };

          if (!found.some((i) => i.url === entry.url)) {
            found.push(entry);
          }
        });

        zeroconf.on("error", (err) => {
          if (!isActive || stopped) return;
          console.warn("[mDNS] error:", err);
        });

        zeroconf.scan("home-assistant", "tcp", "local.");


        const timeout = setTimeout(() => finishDiscovery(found), SCAN_TIMEOUT_MS);

        return () => {
          isActive = false;
          clearTimeout(timeout);
          stop();
        };
        }, [manualAddress])
  );

  return (
      <View className="flex-1">
        <View className="flex-1" />

        <View className="flex-[7] bg-white px-6 pt-6 rounded-t-3xl">
          <View className="gap-1">
            <Text className="text-primaryTo text-h3 font-bold">
              Searching for Home Assistant
            </Text>
            <Text className="text-textSecondary text-body font-semibold">
              Neura Home is searching for your Home Assistant instance. This may
              take a few minutes.
            </Text>
          </View>

          <View className="flex-1 items-center justify-center">
            <View
              className="relative items-center justify-center"
              style={{ width: 260, height: 260 }}
            >
              <Spinner size={260} />

              <View
                  className="absolute inset-0 items-center justify-center"
                  style={{ top: 0, bottom: 0, left: 0, right: 0, transform: [{ translateY: -4 }] }}
              >
                <Image
                  source={require("../../../assets/logo/png/logoGradientSquareNoText.png")}
                  style={{ width: 120, height: 120 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Pressable className="mt-36" onPress={() => router.replace("/homeAssistant/haManualAddress")}>
              <Text className="text-textSecondary text-body font-semibold">
                Add address manually
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
  );
};

export default HaSearch;
