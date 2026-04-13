// aiRunAutomation.ts
import { api } from "@/lib/api/client";

export type RunAutomationResponse = {
  room: string;
  executed?: {
    entity_id: string;
    action: string;
    status: string;
  }[];
  message?: string;
};

export async function runAutomation(room: string) {
  try {
    const response = await api<RunAutomationResponse>(
      `/automation/run?room=${encodeURIComponent(room)}`,
      {
        method: "POST",
        auth: true,
      }
    );

    return response;

  } catch (err) {
    console.error("[runAutomation] Error:", err);
    throw err;
  }
}