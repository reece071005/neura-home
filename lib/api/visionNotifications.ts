import { api } from "@/lib/api/client";

const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 20;

export type VisionNotification = {
  id: number;
  message: string;
  camera_entity: string;
  image: string;
  created_at: string;
};

export type VisionNotificationsResponse = VisionNotification[];

const notificationCache = new Map<number, VisionNotification>();

export function getImageUri(base64: string): string {
  if (!base64) return "";
  if (base64.startsWith("data:")) return base64;
  return `data:image/jpeg;base64,${base64}`;
}

export async function getVisionNotifications(
  skip = 0,
  limit = DEFAULT_PAGE_LIMIT
): Promise<VisionNotificationsResponse> {

  const safeSkip =
    Number.isFinite(skip) ? Math.max(0, Math.floor(skip)) : 0;

  const safeLimit =
    Number.isFinite(limit)
      ? Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(limit)))
      : DEFAULT_PAGE_LIMIT;

  const response = await api<VisionNotificationsResponse>(
    `/vision/get-all-notifications?skip=${safeSkip}&limit=${safeLimit}`,
    { auth: true }
  );

  // Cache notifications locally
  for (const notification of response) {
    notificationCache.set(notification.id, notification);
  }

  return response;
}

export async function getVisionNotificationById(
  notificationId: number
): Promise<VisionNotification> {

  const response = await api<VisionNotification>(
    `/vision/get-notification/${notificationId}`,
    { auth: true }
  );

  notificationCache.set(response.id, response);

  return response;
}

export function getCachedVisionNotification(
  notificationId: number
): VisionNotification | null {
  return notificationCache.get(notificationId) ?? null;
}