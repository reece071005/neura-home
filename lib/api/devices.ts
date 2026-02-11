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

export async function getSystemOverview() {
  const devices = await listDevices();

  const totalDevices = devices.length;

  const totalSensors = devices.filter(
    (d) => d.kind === "sensor" || d.kind === "binary_sensor"
  ).length;

  return {
    totalDevices,
    totalSensors,
  };
}
