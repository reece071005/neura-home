// lib/api/hub/saveHomeAssistantConfig.ts
import { api } from "@/lib/api/client";

export type SaveHomeAssistantConfigBody = {
  url: string; //HA URL
  secret?: string; //HA Token
};

export type SaveHomeAssistantConfigResponse = {
  url: string;
  secret?: string;
};

export async function saveHomeAssistantConfig(body: SaveHomeAssistantConfigBody) {
  return api<SaveHomeAssistantConfigResponse>("/hub/home-assistant", {
    method: "POST",
    body,
    auth: false,
  });
}
