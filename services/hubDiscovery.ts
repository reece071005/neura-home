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

function getSubnet(ip: string) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}


// Fetch with timeout so dead IPs don't block scanning
async function fetchWithTimeout(url: string, timeout = 800) {
  const controller = new AbortController();

  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function tryHub(ip: string): Promise<Hub | null> {
  const res = await fetchWithTimeout(`http://${ip}:8000/health`);

  if (!res || !res.ok) return null;

  try {
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


// Hub discovery
export function startHubDiscovery(opts: DiscoverOptions) {

  const timeoutMs = opts.timeoutMs ?? 6000;
  const preferredIp = "192.168.10.123";

  let stopped = false;

  const stop = () => {
    stopped = true;
  };

  const scan = async () => {

    try {
      const preferred = await tryHub(preferredIp);

      if (preferred && !stopped) {
        stopped = true;
        opts.onFound(preferred);
        return;
      }

      const deviceIp = await Network.getIpAddressAsync();
      if (stopped) return;

      const subnet = getSubnet(deviceIp);
      if (!subnet) {
        opts.onError?.(new Error("Unable to determine subnet"));
        return;
      }

      const ips: string[] = [];

      for (let i = 1; i < 255; i++) {
        const ip = `${subnet}.${i}`;
        if (ip !== preferredIp) ips.push(ip);
      }

      const BATCH_SIZE = 20;

      for (let i = 0; i < ips.length && !stopped; i += BATCH_SIZE) {

        const batch = ips.slice(i, i + BATCH_SIZE);

        const results = await Promise.all(
          batch.map(ip => tryHub(ip))
        );

        const hub = results.find(Boolean);

        if (hub && !stopped) {
          stopped = true;
          opts.onFound(hub);
          return;
        }
      }

      if (!stopped) opts.onTimeout();

    } catch (err) {

      if (!stopped) {
        opts.onError?.(err as Error);
      }

    }

  };

  scan();

  const timer = setTimeout(() => {
    if (!stopped) {
      stopped = true;
      opts.onTimeout();
    }
  }, timeoutMs);

  return () => {
    stop();
    clearTimeout(timer);
  };
}


// Check specific hub address
export async function checkHubAddress(ip: string): Promise<Hub | null> {

  const res = await fetchWithTimeout(`http://${ip}:8000/health`);

  if (!res || !res.ok) return null;

  try {

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


// Rediscover hub
export async function rediscoverHub(timeoutMs = 10000): Promise<string | null> {

  const hub = await getHubBaseUrl();
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {

    try {

      if (hub) {

        const res = await fetchWithTimeout(`${hub}/health`, 800);

        if (res && res.ok) {

          const data = await res.json();

          if (data?.status === "healthy") {
            return hub;
          }
        }
      }

    } catch {}

    await new Promise(r => setTimeout(r, 700));

  }

  return null;
}