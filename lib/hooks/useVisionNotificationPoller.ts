import { useEffect, useRef } from "react";
import { getVisionNotifications, VisionNotification } from "@/lib/api/visionNotifications";
import { sendLocalNotification } from "@/services/pushNotifications";

const POLL_INTERVAL = 30000; // 10 seconds

export function useVisionNotificationPoller() {
  const knownIdsRef = useRef<Set<number> | null>(null);
  console.log("Started polling for vision notifications");

  useEffect(() => {
    async function poll() {
      try {
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
            console.log("New notification:", item);
          await sendLocalNotification(
            "New Detection Alert",
            item.message ?? "Motion detected"
          );
          knownIdsRef.current!.add(item.id);
        }
      } catch (e) {
        // Silent — don't crash if API is unreachable
      }
    }

    poll(); // run immediately on mount
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);
}