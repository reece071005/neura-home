import { Image, Text, View } from "react-native";
import { Link, router } from "expo-router";
import React, { useEffect, useRef } from "react";
import Zeroconf from "react-native-zeroconf";

import Spinner from "@/components/Spinner";
import { DiscoveredHA, setDiscoveredInstances } from "@/lib/storage/onboardingStore";

const SCAN_TIMEOUT_MS = 8000;

const HaSearch = () => {
  const navigated = useRef(false);

  useEffect(() => {
    const zeroconf = new Zeroconf();
    const found: DiscoveredHA[] = [];
    let stopped = false;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
    };

    const finish = (instances: DiscoveredHA[]) => {
      if (navigated.current) return;
      navigated.current = true;
      stop();
      setDiscoveredInstances(instances);

      if (instances.length > 0) {
        router.replace("/(onboarding)/haFound");
      } else {
        router.replace("/(onboarding)/haNotFound");
      }
    };

    zeroconf.on("resolved", (service) => {
      const host = service.addresses?.[0];
      if (!host) return;

      const port = service.port ?? 8123;
      const entry: DiscoveredHA = {
        name: service.txt?.friendly_name ?? service.name ?? "Home Assistant",
        host,
        port,
        url: `http://${host}:${port}`,
      };

      // Avoid duplicates
      if (!found.some((i) => i.url === entry.url)) {
        found.push(entry);
      }
    });

    zeroconf.on("error", (err) => console.warn("[mDNS] error:", err));

    zeroconf.scan("home-assistant", "tcp", "local.");

    // After timeout, navigate with whatever was found
    const timeout = setTimeout(() => finish(found), SCAN_TIMEOUT_MS);

    return () => {
      clearTimeout(timeout);
      stop();
    };
  }, []);

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

            <View className="absolute inset-0 items-center justify-center">
              <Image
                source={require("../../assets/logo/png/logoGradientSquareNoText.png")}
                style={{ width: 180, height: 180 }}
                resizeMode="contain"
              />
            </View>
          </View>

          <Link href="/(onboarding)/haManualAddress" className="mt-36">
            <Text className="text-textSecondary text-body font-semibold">
              Add address manually
            </Text>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default HaSearch;