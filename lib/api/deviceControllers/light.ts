import { api } from "@/lib/api/client";

type LightPayload = {
  entity_id: string;
  state: "on" | "off";
  brightness?: number;
};

type LightResponse = { success: boolean; message: string };

export function setLight(payload: LightPayload) {
  console.log(payload);
  return api<LightResponse>("/homecontrollers/light", {
    method: "POST",
    body: payload,
    auth: true,
  });
}
