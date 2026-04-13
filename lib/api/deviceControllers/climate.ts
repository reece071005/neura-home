// src/lib/api/deviceControllers/climate.ts
import { api } from "@/lib/api/client";

export type ClimateHvacMode = "heat" | "cool" | "heat_cool" | "auto" | "off";

export type ClimatePayload = {
  entity_id: string;
  state?: "on" | "off";
  temperature?: number; // °C
  hvac_mode?: ClimateHvacMode;

  preset_mode?: string;
  fan_mode?: string;
  swing_mode?: "on" | "off" | string;
  swing_horizontal_mode?: "on" | "off" | string;
};

type ClimateResponse = {
  success: boolean;
  message: string;
};

export function setClimate(payload: ClimatePayload) {
  return api<ClimateResponse>("/homecontrollers/climate", {
    method: "POST",
    body: payload,
    auth: true,
  });
}
