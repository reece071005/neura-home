import { api } from "@/lib/api/client";

export type ApiDevice = {
    entity_id: string;
    kind:
        | "light"
        | "fan"
        | "switch"
        | "cover"
        | "climate"
        | "media_player"
        | "camera"
        | "sensor"
        | "binary_sensor";
    name: string;
    area?: string;
};

export function listDevices() {
    return api<ApiDevice[]>("/homecontrollers/devices", {
        method: "GET",
        auth: true,
    });
}
