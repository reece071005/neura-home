import { api } from "@/lib/api/client";
import type { DashboardItem } from "@/lib/storage/dashboardWidgetStore";

export type UserStateRow = {
  id: number;
  user_id: number;
  state: any;
  created_at: string;
  updated_at: string;
};

export type DashboardStateV1 = {
  dashboard: {
    version: 1;
    items: DashboardItem[];
  };
};

export function getDashboardState() {
  return api<UserStateRow>("/auth/users/get-user-state", {
    method: "GET",
    auth: true,
  });
}

export function setDashboardState(state: any) {
  return api<UserStateRow>("/auth/users/set-user-state", {
    method: "POST",
    auth: true,
    body: { state },
  });
}

