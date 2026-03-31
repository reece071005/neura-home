import { api } from "@/lib/api/client";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.239:8000";

/* ---------------- Types ---------------- */

export type VisionNotification = {
  id: number;
  message: string;
  camera_entity: string;  // was camera_name
  image: string;          // base64 jpeg data (no prefix)
  created_at: string;
};

export type VisionNotificationsResponse = VisionNotification[];

/* ---------------- Helpers ---------------- */

/** Prepend the data URI prefix so React Native <Image> can render it */
export function getImageUri(base64: string): string {
  if (!base64) return "";
  // Already has prefix
  if (base64.startsWith("data:")) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

/* ---------------- API ---------------- */

export async function getVisionNotifications(
  skip = 0,
  limit = 50
): Promise<VisionNotificationsResponse> {
  return api<VisionNotificationsResponse>(
    `/vision/get-all-notifications?skip=${skip}&limit=${limit}`,
    { auth: true }
  );
}

export async function getVisionNotificationById(
  notificationId: number
): Promise<VisionNotification> {
  return api<VisionNotification>(`/vision/get-notification/${notificationId}`, {
    auth: true,
  });
}