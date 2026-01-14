export type Hub = {
    id: string;
    name: string;
    ip: string;
};

export type DiscoverOptions = {
    timeoutMs: number;
    onFound: (hub: Hub) => void;
    onTimeout: () => void;
    onError?: (err: Error) => void;

    fake?: {
        outcome: "found" | "timeout";
        delayMs?: number;
    };
};

export function startHubDiscovery(opts: DiscoverOptions) {
    const delay = opts.fake?.delayMs ?? opts.timeoutMs ?? 5000;
    const outcome = opts.fake?.outcome ?? "found";

    let stopped = false;

    const timer = setTimeout(() => {
        if (stopped) return;

        if (outcome === "found") {
            opts.onFound({id: "hub-1", name: "Neura Hub", ip: "http://192.168.1.50"});
        } else {
            opts.onTimeout();
        }
    }, delay);

    return () => {
        stopped = true;
        clearTimeout(timer);
    };
}

