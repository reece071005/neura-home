import { api } from "@/lib/api/client";

// Get, Set, Delete AI preferences (on or off)
export type RoomAiPreferences = {
    room: string;
    enabled: boolean;
};

export async function getRoomAiPreferences(room: string) {
    const url = `/ai/room-ai/preferences?room=${encodeURIComponent(room)}`;
    console.log('📤 [getRoomAiPreferences] Request:', url);

    try {
        const response = await api<{ preferences: RoomAiPreferences }>(url, { auth: true });
        console.log('📥 [getRoomAiPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [getRoomAiPreferences] Error:', error);
        throw error;
    }
}

export async function setRoomAiPreferences(room: string, enabled: boolean) {
    const body = { room, enabled };
    console.log('📤 [setRoomAiPreferences] Request:', { url: '/ai/room-ai/preferences', body });

    try {
        const response = await api<{ ok: boolean }>(`/ai/room-ai/preferences`, {
            method: "POST",
            auth: true,
            body,
        });
        console.log('📥 [setRoomAiPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [setRoomAiPreferences] Error:', error);
        throw error;
    }
}

export async function deleteRoomAiPreferences(room: string) {
    const url = `/ai/room-ai/preferences?room=${encodeURIComponent(room)}`;
    console.log('📤 [deleteRoomAiPreferences] Request:', url);

    try {
        const response = await api<{ ok: boolean }>(url, {
            method: "DELETE",
            auth: true,
        });
        console.log('📥 [deleteRoomAiPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [deleteRoomAiPreferences] Error:', error);
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
    console.log('📤 [getTrainingPreferences] Request:', url);

    try {
        const response = await api<{ preferences: TrainingSchedule }>(url, { auth: true });
        console.log('📥 [getTrainingPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [getTrainingPreferences] Error:', error);
        throw error;
    }
}

export async function setTrainingPreferences(room: string, enabled: boolean, frequency: TrainingFrequency) {
    const body = { room, enabled, frequency };
    console.log('📤 [setTrainingPreferences] Request:', { url: '/ai/training/preferences', body });

    try {
        const response = await api<{ ok: boolean }>(`/ai/training/preferences`, {
            method: "POST",
            auth: true,
            body,
        });
        console.log('📥 [setTrainingPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [setTrainingPreferences] Error:', error);
        throw error;
    }
}

export async function deleteTrainingPreferences(room: string) {
    const url = `/ai/training/preferences?room=${encodeURIComponent(room)}`;
    console.log('📤 [deleteTrainingPreferences] Request:', url);

    try {
        const response = await api<{ ok: boolean }>(url, {
            method: "DELETE",
            auth: true,
        });
        console.log('📥 [deleteTrainingPreferences] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [deleteTrainingPreferences] Error:', error);
        throw error;
    }
}

// Train model manually
export async function trainRoomModel(room: string) {
    const body = { room };
    console.log('📤 [trainRoomModel] Request:', { url: '/ai/training/run', body });

    try {
        const response = await api<{ ok: boolean }>(`/ai/training/run`, {
            method: "POST",
            auth: true,
            body,
        });
        console.log('📥 [trainRoomModel] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [trainRoomModel] Error:', error);
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
    minDays: number = 0,
    lookbackDays: number = 60
) {
    const useMockData = false;

    if (useMockData) {
        const mockData = {
            ok: true,
            ready: false,
            room: room,
            days_available: 10,
            min_days_required: 14,
            message: "Still collecting data",
        };
        console.log('🎭 [getTrainingReadiness] Using mock data:', mockData);
        return mockData;
    }

    const url = `/ai/training-readiness?room=${encodeURIComponent(room)}&min_days=${minDays}&lookback_days=${lookbackDays}`;
    console.log('📤 [getTrainingReadiness] Request:', url);

    try {
        const response = await api<TrainingReadiness>(url, { auth: true });
        console.log('📥 [getTrainingReadiness] Response:', response);
        return response;
    } catch (error) {
        console.error('❌ [getTrainingReadiness] Error:', error);
        throw error;
    }
}