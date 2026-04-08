import * as Network from "expo-network";
import { getHubBaseUrl } from "@/lib/storage/hubStore";

export type Hub = {
    id: string;
    name: string;
    ip: string;
};

export type DiscoverOptions = {
    timeoutMs?: number;
    onFound: (hub: Hub) => void;
    onTimeout: () => void;
    onError?: (err: Error) => void;
};

// Extract subnet (e.g. 192.168.1 from 192.168.1.34)
function getSubnet(ip: string) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

// Attempt connection to a hub
async function tryHub(ip: string): Promise<Hub | null> {
    try {
        const res = await fetch(`http://${ip}:8000/health`);

        if (!res.ok) return null;

        const data = await res.json();

        if (data?.status === "healthy") {
            return {
                id: data?.hub_id ?? "hub",
                name: "Neura Hub",
                ip: `http://${ip}:8000`,
            };
        }

    } catch {}

    return null;
}

//Discovery process for macbook (mdns not possible)
export function startHubDiscovery(opts: DiscoverOptions) {

    const timeoutMs = opts.timeoutMs ?? 6000;
    const preferredIp = "192.168.10.123";

    let stopped = false;

    const scan = async () => {

        try {

            //Try preferred IP first
            const preferred = await tryHub(preferredIp);
            if (preferred) {
                stopped = true;
                opts.onFound(preferred);
                return;
            }

            //Get device IP
            const deviceIp = await Network.getIpAddressAsync();
            const subnet = getSubnet(deviceIp);

            //Scan subnet
            for (let i = 1; i < 255 && !stopped; i++) {

                const ip = `${subnet}.${i}`;

                if (ip === preferredIp) continue;

                const hub = await tryHub(ip);

                if (hub) {
                    stopped = true;
                    opts.onFound(hub);
                    return;
                }
            }

            if (!stopped) opts.onTimeout();

        } catch (err) {
            opts.onError?.(err as Error);
        }
    };

    scan();

    const timer = setTimeout(() => {
        if (stopped) return;
        stopped = true;
        opts.onTimeout();
    }, timeoutMs);

    return () => {
        stopped = true;
        clearTimeout(timer);
    };
}

//Hub rediscovery (IP Address change)
export async function rediscoverHub(timeoutMs = 10000): Promise<string | null> {

  const hub = await getHubBaseUrl();
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {

    try {

      if (hub) {
        const res = await fetch(`${hub}/health`);

        if (res.ok) {
          const data = await res.json();

          if (data?.status === "healthy") {
            return hub;
          }
        }
      }

    } catch {}

    await new Promise(r => setTimeout(r, 700)); // wait before retry

  }

  return null;
}