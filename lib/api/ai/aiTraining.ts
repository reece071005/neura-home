// aiTraining.ts
import { api } from "@/lib/api/client";

export type RoomAiPreferences = {
    room: string;
    enabled: boolean;
};

export async function getRoomAiPreferences(room: string) {
    const url = `/ai/room-ai/preferences?room=${encodeURIComponent(room)}`;
    try {
        const response = await api<{ preferences: RoomAiPreferences }>(url, { auth: true });
        return response;
    } catch (error) {
        console.error('[getRoomAiPreferences] Error:', error);
        throw error;
    }
}

export async function setRoomAiPreferences(room: string, enabled: boolean) {
    const body = { room, enabled };
    try {
        const response = await api<{ ok: boolean }>(`/ai/room-ai/preferences`, {
            method: "POST",
            auth: true,
            body,
        });
        return response;
    } catch (error) {
        console.error('[setRoomAiPreferences] Error:', error);
        throw error;
    }
}

export async function deleteRoomAiPreferences(room: string) {
    const url = `/ai/room-ai/preferences?room=${encodeURIComponent(room)}`;
    try {
        const response = await api<{ ok: boolean }>(url, {
            method: "DELETE",
            auth: true,
        });
        return response;
    } catch (error) {
        console.error('[deleteRoomAiPreferences] Error:', error);
        throw error;
    }
}


// Get, set, delete training preferences
export type TrainingFrequency = "daily" | "weekly" | "monthly";

export type TrainingSchedule = {
    room: string;
    enabled: boolean;
    frequency: TrainingFrequency;
    last_trained_at?: string | null;
};

export async function getTrainingPreferences(room: string) {
    const url = `/ai/training/preferences?room=${encodeURIComponent(room)}`;
    try {
        const response = await api<{ preferences: TrainingSchedule }>(url, { auth: true });
        return response;
    } catch (error) {
        console.error('[getTrainingPreferences] Error:', error);
        throw error;
    }
}

export async function setTrainingPreferences(room: string, enabled: boolean, frequency: TrainingFrequency) {
    const body = { room, enabled, frequency };
    try {
        const response = await api<{ ok: boolean }>(`/ai/training/preferences`, {
            method: "POST",
            auth: true,
            body,
        });
        return response;
    } catch (error) {
        console.error(' [setTrainingPreferences] Error:', error);
        throw error;
    }
}

export async function deleteTrainingPreferences(room: string) {
    const url = `/ai/training/preferences?room=${encodeURIComponent(room)}`;
    try {
        const response = await api<{ ok: boolean }>(url, {
            method: "DELETE",
            auth: true,
        });
        return response;
    } catch (error) {
        console.error('[deleteTrainingPreferences] Error:', error);
        throw error;
    }
}

// Train models manually
export async function trainRoomModel(room: string, days: number = 60) {
  const url = `/ai/train-room-all-xgb?room=${encodeURIComponent(room)}&days=${days}`;
  try {
    const response = await api<{ ok: boolean }>(url, {
      method: "POST",
      auth: true,
    });
    return response;
  } catch (error) {
    console.error("[trainRoomModel] Error:", error);
    throw error;
  }
}

// Training readiness
export type TrainingReadiness = {
    ok: boolean;
    ready: boolean;
    room: string;
    days_available: number;
    min_days_required: number;
    message?: string;
};

export async function getTrainingReadiness(
    room: string,
    minDays: number = 14,
    lookbackDays: number = 60
) {
    const url = `/ai/training-readiness?room=${encodeURIComponent(room)}&min_days=${minDays}&lookback_days=${lookbackDays}`;
    try {
        const response = await api<TrainingReadiness>(url, { auth: true });
        return response;
    } catch (error) {
        console.error('[getTrainingReadiness] Error:', error);
        throw error;
    }
}
