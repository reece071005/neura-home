import type { DashboardRow } from "@/lib/dashboard/dashboardTypes";

export function getDashboardEntityIds(layout: DashboardRow[]): string[] {
    const ids = new Set<string>();

    for (const row of layout) {
        if (row.type === "full") {
            if (row.item.entityId) ids.add(row.item.entityId);
        }

        if (row.type === "two") {
            row.items.forEach((t) => {
                if (t.entityId) ids.add(t.entityId);
            });
        }

        if (row.type === "split") {
            if (row.left.entityId) ids.add(row.left.entityId);
            row.right.forEach((t) => {
                if (t.entityId) ids.add(t.entityId);
            });
        }
    }

    return Array.from(ids);
}
