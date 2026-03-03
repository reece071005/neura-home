import { useEffect, useState } from "react";
import Zeroconf from "react-native-zeroconf";

export type DiscoveredHA = {
  name: string;
  host: string;
  port: number;
  url: string;
};

export function useHADiscovery() {
  const [instances, setInstances] = useState<DiscoveredHA[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const zeroconf = new Zeroconf();

    zeroconf.on("resolved", (service) => {
      const host = service.addresses?.[0];
      const port = service.port ?? 8123;
      if (!host) return;

      const entry: DiscoveredHA = {
        name: service.name ?? "Home Assistant",
        host,
        port,
        url: `http://${host}:${port}`,
      };

      setInstances((prev) =>
        prev.some((i) => i.url === entry.url) ? prev : [...prev, entry]
      );
    });

    zeroconf.on("error", (err) => console.warn("[mDNS] error:", err));

    setScanning(true);
    zeroconf.scan("home-assistant", "tcp", "local.");

    // Stop scanning after 10 seconds
    const timeout = setTimeout(() => {
      zeroconf.stop();
      setScanning(false);
    }, 10000);

    return () => {
      clearTimeout(timeout);
      zeroconf.stop();
      zeroconf.removeDeviceListeners();
    };
  }, []);

  return { instances, scanning };
}