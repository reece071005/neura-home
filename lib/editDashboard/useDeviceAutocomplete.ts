// useDeviceAutocomplete.ts
import { useEffect, useMemo, useState } from "react";

import { listDevices, type ApiDevice } from "@/lib/api/devices";
import type { TileKind } from "@/lib/storage/dashboardWidgetStore";
import { TILEKIND_TO_DEVICEKINDS } from "@/lib/editDashboard/dashboardTypes";

type Args = {
    kind: TileKind;
    query: string;
    limit?: number;
};

export function useDeviceAutocomplete({ kind, query, limit = 10 }: Args) {
    const [devices, setDevices] = useState<ApiDevice[]>([]);
    const [devicesLoading, setDevicesLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        setDevicesLoading(true);

        listDevices()
            .then((res) => {
                if (mounted) setDevices(res);
            })
            .catch(() => {
                if (mounted) setDevices([]);
            })
            .finally(() => {
                if (mounted) setDevicesLoading(false);
            });

        return () => {
            mounted = false;
        };
        }, []);

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        const allowed = TILEKIND_TO_DEVICEKINDS[kind];

        if (!allowed || allowed.length === 0) return [];

        return devices
            .filter((d) => allowed.includes(d.kind))
            .filter((d) => {
                if (!q) return true;
                return (
                    d.entity_id.toLowerCase().includes(q) ||
                    d.name.toLowerCase().includes(q) ||
                    (d.area?.toLowerCase().includes(q) ?? false)
                );
            })
            .slice(0, limit);
        }, [devices, kind, query, limit]);

    return { devicesLoading, suggestions };
}
