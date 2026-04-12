import { api } from "@/lib/api/client";

const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 20;

export type AiNotification = {
  id: number;
  message: string;
  room: string;
  entity_id: string;
  notification_type: "suggested" | "executed" | string;
  action_type: "light_on" | "light_off" | "climate" | "none" | string;
  meta: Record<string, any>;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
};

export type AiNotificationsResponse = AiNotification[];

const notificationCache = new Map<number, AiNotification>();

export async function getAiNotifications(
  skip = 0,
  limit = DEFAULT_PAGE_LIMIT
): Promise<AiNotificationsResponse> {

  const safeSkip =
    Number.isFinite(skip) ? Math.max(0, Math.floor(skip)) : 0;

  const safeLimit =
    Number.isFinite(limit)
      ? Math.min(MAX_PAGE_LIMIT, Math.max(1, Math.floor(limit)))
      : DEFAULT_PAGE_LIMIT;

  const response = await api<AiNotificationsResponse>(
    `/ai-notifications/get-all-notifications?skip=${safeSkip}&limit=${safeLimit}`,
    { auth: true }
  );

  for (const notification of response) {
    notificationCache.set(notification.id, notification);
  }

  return response;
}

export async function getAiNotificationById(
  notificationId: number
): Promise<AiNotification> {

  const response = await api<AiNotification>(
    `/ai-notifications/get-notification/${notificationId}`,
    { auth: true }
  );

  notificationCache.set(response.id, response);

  return response;
}

export function getCachedAiNotification(
  notificationId: number
): AiNotification | null {
  return notificationCache.get(notificationId) ?? null;
}