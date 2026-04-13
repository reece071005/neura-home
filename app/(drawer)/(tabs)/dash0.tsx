//dash0.tsx
import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DashboardScreen from "./shared/DashboardScreen";
import { useDashboardWidgetsStore } from "@/lib/storage/dashboardWidgetStore";

export default function Dash0() {
  const dashboards = useDashboardWidgetsStore((s) => s.dashboards);
  const setActiveDashboard = useDashboardWidgetsStore((s) => s.setActiveDashboard);

  useFocusEffect(
    useCallback(() => {
      const d = dashboards[0];
      if (d) setActiveDashboard(d.id);
    }, [dashboards, setActiveDashboard])
  );

  return <DashboardScreen />;
}
