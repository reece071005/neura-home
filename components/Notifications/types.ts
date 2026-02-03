export type NotificationType =
    | "automation"
    | "package"
    | "device"
    | "security"
    | "system";

export type NotificationSeverity = "info" | "warning" | "critical";

export type NotificationItem = {
    id: string;
    type: NotificationType;
    severity: NotificationSeverity;

    title: string;
    message: string;

    // Optional deep-link metadata for future backend integration:
    // e.g. navigate to "AutomationDetails" with automationId
    action?: {
        label: string;
        route?: string; // expo-router route string
        params?: Record<string, any>;
    };

    createdAt: string; // ISO string
    readAt?: string; // ISO string if read
};