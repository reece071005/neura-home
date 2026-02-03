// lib/api/state.ts
import { api } from "@/lib/api/client";

export type HAState = {
    entity_id: string;
    state: string; // "on"/"off"/etc
    last_changed?: string;
    last_updated?: string;
};

export async function getCurrentState() {
    const res = await api<HAState[]>("/homecontrollers/current-state", {
        method: "GET",
        auth: true,
    });

    return res
}
