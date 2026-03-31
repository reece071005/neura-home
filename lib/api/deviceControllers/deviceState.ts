// lib/api/deviceState.ts

import { api } from "@/lib/api/client";

export interface LightDeviceAttributes {
    supported_color_modes?: string[];
    color_mode?: string;
    brightness?: number;
    color_temp_kelvin?: number | null;
    min_color_temp_kelvin?: number;
    max_color_temp_kelvin?: number;
    rgb_color?: [number, number, number] | null;
    hs_color?: [number, number] | null;
    xy_color?: [number, number] | null;
    friendly_name?: string;
    [key: string]: any;
}

export interface DeviceState {
    entity_id: string;
    state: string;
    attributes: LightDeviceAttributes;
    last_changed: string;
    last_updated: string;
}

export interface LightCapabilities {
    hasColor: boolean;
    hasTemp: boolean;
    minKelvin: number;
    maxKelvin: number;
}

export async function getDeviceState(entityId: string): Promise<DeviceState> {
  return api<DeviceState>(
    `/homecontrollers/current-state-device?entity_id=${encodeURIComponent(entityId)}`,
    { auth: true }
  );
}

export function parseLightCapabilities(state: DeviceState): LightCapabilities {
  const modes = state.attributes.supported_color_modes ?? [];
  return {
    hasColor: modes.some((m) => m === "xy" || m === "hs" || m === "rgb"),
    hasTemp:  modes.some((m) => m === "color_temp"),
    minKelvin: state.attributes.min_color_temp_kelvin ?? 2000,
    maxKelvin: state.attributes.max_color_temp_kelvin ?? 6500,
  };
}