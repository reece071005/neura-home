import { useEffect, useRef } from "react";
import { getVisionNotifications } from "@/lib/api/notifications/visionNotifications";
import { sendLocalNotification } from "@/services/pushNotifications";
import { getToken } from "@/lib/storage/token";
import { SessionExpiredError } from "@/lib/api/client";

const POLL_INTERVAL = 30000;

export function useVisionNotificationPoller() {
  const knownIdsRef = useRef<Set<number> | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    async function poll() {
      if (stoppedRef.current) return;

      try {
        const token = await getToken();
        if (!token) return;

        const data = await getVisionNotifications(0, 2);

        if (knownIdsRef.current === null) {
          knownIdsRef.current = new Set(data.map((n) => n.id));
          return;
        }

        const newItems = data.filter((n) => !knownIdsRef.current!.has(n.id));

        for (const item of newItems) {
          await sendLocalNotification(
            "New Detection Alert",
            item.message ?? "Motion detected"
          );
          knownIdsRef.current!.add(item.id);
        }
      } catch (e) {
        if (e instanceof SessionExpiredError) {
          stoppedRef.current = true;
          return;
        }
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      stoppedRef.current = true;
      clearInterval(interval);
    };
  }, []);
}
