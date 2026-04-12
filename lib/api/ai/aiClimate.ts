import { api } from "@/lib/api/client";

export type ClimatePreferences = {
  room: string;
  enabled: boolean;
  arrival_time_weekday: string;
  arrival_time_weekend: string;
  lead_minutes: number;
  min_temp_delta: number;
  fallback_setpoint: number;
  active_confidence_threshold: number;
  min_setpoint_c: number;
  max_setpoint_c: number;
};


// GET /ai/climate/preferences
export async function getClimatePreferences(room: string) {
  const response = await api<ClimatePreferences>(
    `/ai/climate/preferences?room=${encodeURIComponent(room)}`,
    { auth: true }
  );

  console.log("Climate prefs response:", response);

  return response;
}

// POST /ai/climate/preferences
export async function setClimatePreferences(data: ClimatePreferences) {
  return api<string>(`/ai/climate/preferences`, {
    method: "POST",
    body: data,
    auth: true,
  });
}

// DELETE /ai/climate/preferences
export async function deleteClimatePreferences(room: string) {
  return api<string>(`/ai/climate/preferences?room=${encodeURIComponent(room)}`, {
    method: "DELETE",
    auth: true,
  });
}