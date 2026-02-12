import { router } from "expo-router";

import { clearToken } from "@/lib/storage/token";
import { useDashboardWidgetsStore } from "@/lib/storage/dashboardWidgetStore";



export async function logout() {
  await clearToken();
  await useDashboardWidgetsStore.persist.clearStorage();

  useDashboardWidgetsStore.setState({
    dashboards: [{ id: "dash_default", name: "Dashboard" }],
    activeDashboardId: "dash_default",
    layoutsById: { dash_default: [] },
    items: [],
  });

  router.replace("/");
}
