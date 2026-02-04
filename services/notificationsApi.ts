import { NotificationItem } from "@/components/Notifications/types";

// replace with backend later

export async function fetchNotifications(): Promise<NotificationItem[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 400));

    const now = Date.now();
    const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

    return [
        {
            id: "n1",
            type: "automation",
            severity: "info",
            title: "Automation created",
            message: "“Night Mode” will arm doors, dim lights, and enable camera alerts at 11:00 PM.",
            createdAt: iso(1000 * 60 * 8),
            action: { label: "View automation", route: "/automations" },
        },
        {
            id: "n2",
            type: "package",
            severity: "warning",
            title: "Package detected at the door",
            message: "Front Door camera detected a package. Tap to review the clip and confirm delivery.",
            createdAt: iso(1000 * 60 * 34),
            action: { label: "Open cameras", route: "/cameraDashboard" },
        },
        {
            id: "n3",
            type: "device",
            severity: "critical",
            title: "Device needs attention",
            message: "Living Room camera is offline. Check Wi-Fi or power and try reconnecting.",
            createdAt: iso(1000 * 60 * 85),
            action: { label: "Manage devices", route: "/devices" },
        },
        {
            id: "n4",
            type: "system",
            severity: "info",
            title: "App update applied",
            message: "Performance improvements and new notification filters are now available.",
            createdAt: iso(1000 * 60 * 220),
            readAt: iso(1000 * 60 * 200),
        },
    ];
}
