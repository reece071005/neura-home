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

//Discovery process for macbook (mdns not possible)
export function startHubDiscovery(opts: DiscoverOptions) {
    const timeoutMs = opts.timeoutMs ?? 6000;
    const preferredIp = "192.168.10.123";

    let stopped = false;

    const tryHub = async (ip: string): Promise<boolean> => {
        try {
            const res = await fetch(`http://${ip}:8000/health`);

            if (!res.ok) return false;

            const data = await res.json();

            if (data?.status === "healthy") {
                stopped = true;

                opts.onFound({
                    id: data?.hub_id ?? "hub",
                    name: "Neura Hub",
                    ip: `http://${ip}:8000`,
                });

                return true;
            }

        } catch {
            //ignore connection failures
        }
        return false;
    };

    const scan = async () => {
        try {
            //Try preferred IP first
            if (await tryHub(preferredIp)) return;

            //Scan subnet
            for (let i = 1; i < 255 && !stopped; i++) {
                const ip = `192.168.10.${i}`;

                if (ip === preferredIp) continue;

                const found = await tryHub(ip);
                if (found) return;
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
