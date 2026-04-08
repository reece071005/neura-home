import { api } from "@/lib/api/client";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.10.123:8000";
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 20;

/* ---------------- Types ---------------- */

export type VisionNotification = {
  id: number;
  message: string;
  camera_entity: string;  // was camera_name
  image: string;          // base64 jpeg data (no prefix)
  created_at: string;
};

export type VisionNotificationsResponse = VisionNotification[];
const notificationCache = new Map<number, VisionNotification>();

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
  limit = DEFAULT_PAGE_LIMIT
): Promise<VisionNotificationsResponse> {
  const safeSkip = Number.isFinite(skip) ? Math.max(0, Math.floor(skip)) : 0;
  const safeLimit = Number.isFinite(limit)
    ? Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(limit)))
    : DEFAULT_PAGE_LIMIT;

  const response = await api<VisionNotificationsResponse>(
    `/vision/get-all-notifications?skip=${safeSkip}&limit=${safeLimit}`,
    { auth: true }
  );
  for (const notification of response) {
    notificationCache.set(notification.id, notification);
  }
  return response;
}

export async function getVisionNotificationById(
  notificationId: number
): Promise<VisionNotification> {
  const response = await api<VisionNotification>(`/vision/get-notification/${notificationId}`, {
    auth: true,
  });
  notificationCache.set(response.id, response);
  return response;
}

export function getCachedVisionNotification(notificationId: number): VisionNotification | null {
  return notificationCache.get(notificationId) ?? null;
}
