// fan.ts
import { api } from "@/lib/api/client";

type FanPayload = {
  entity_id: string;
  state: "on" | "off";
  percentage?: number;
  oscillating?: boolean;
  direction?: string;
};

type FanResponse = {
  success: boolean;
  message: string;
};

export function setFan(payload: FanPayload) {
  return api<FanResponse>("/homecontrollers/fan", {
    method: "POST",
    body: payload,
    auth: true,
  });
}
