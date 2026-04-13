import { api } from "@/lib/api/client";

const HA_ENDPOINT = "/hub/home-assistant";

// Types
export type HomeAssistantConfig = {
  url?: string;
  secret?: string;
};

export type SaveHomeAssistantConfigBody = {
  url: string;
  secret?: string;
};

// Get Home Assistant config
export async function getHomeAssistantConfig() {
  return api<HomeAssistantConfig>(HA_ENDPOINT, {
    method: "GET",
    auth: false,
  });
}

// Save Home Assistant config
export async function saveHomeAssistantConfig(body: SaveHomeAssistantConfigBody) {
  return api<HomeAssistantConfig>(HA_ENDPOINT, {
    method: "POST",
    body,
    auth: false,
  });
}