import { useEffect, useRef } from "react";
import { getVisionNotifications, VisionNotification } from "@/lib/api/visionNotifications";
import { sendLocalNotification } from "@/services/pushNotifications";
import { getToken } from "@/lib/storage/token";
import { SessionExpiredError } from "@/lib/api/client";

const POLL_INTERVAL = 30000; // 30 seconds

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

        // First run — just store the current IDs, don't notify
        if (knownIdsRef.current === null) {
          knownIdsRef.current = new Set(data.map((n) => n.id));
          return;
        }

        // Find any IDs we haven't seen before
        const newItems = data.filter((n) => !knownIdsRef.current!.has(n.id));

        // Fire a notification for each new one
        for (const item of newItems) {
          await sendLocalNotification(
            "New Detection Alert",
            item.message ?? "Motion detected"
          );
          knownIdsRef.current!.add(item.id);
        }
      } catch (e) {
        if (e instanceof SessionExpiredError) {
          // The global session handler will redirect; stop polling to avoid repeat alerts.
          stoppedRef.current = true;
          return;
        }
        // Silent — don't crash if API is unreachable
      }
    }

    poll(); // run immediately on mount
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      stoppedRef.current = true;
      clearInterval(interval);
    };
  }, []);
}
