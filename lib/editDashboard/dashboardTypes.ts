/**
 * Edit Dashboard type defintions
 *
 * This file defines the types for the dashboard edit page.
 */
import * as mdi from "@mdi/js";
import type { ApiDevice } from "@/lib/api/devices";
import type { TileKind, WidgetSize } from "@/lib/storage/dashboardWidgetStore";

// Editing Tile or Header
export type AddMode = "tile" | "header";

//Tile Kind Options
export const kindOptions: TileKind[] = [
    "light",
    "climate",
    "fan",
    "cover",
    "lock",
    "camera",
    "media",
    "sensor",
    "generic",
];

//Tile size Options
export const sizeOptions: WidgetSize[] = ["small", "large"];

//Simple icon picker (expand later)
export const headerIconOptions: { label: string; iconPath?: string }[] = [
    { label: "None", iconPath: undefined },
    { label: "Sofa", iconPath: mdi.mdiSofa },
    { label: "Bed", iconPath: mdi.mdiBedEmpty },
    { label: "Kitchen", iconPath: mdi.mdiSilverwareForkKnife },
    { label: "Bath", iconPath: mdi.mdiShower },
];

// Map dashboard TileKind -> devices API kinds
export const TILEKIND_TO_DEVICEKINDS: Record<TileKind, ApiDevice["kind"][]> = {
    light: ["light"],
    climate: ["climate"],
    fan: ["fan"],
    cover: ["cover"],
    lock: [], // backend doesn't return lock in ApiDevice.kind yet
    camera: ["camera"],
    media: ["media_player"],
    sensor: ["binary_sensor", "sensor"],
    generic: [
        "light",
        "fan",
        "switch",
        "cover",
        "climate",
        "media_player",
        "camera",
        "sensor",
        "binary_sensor",
    ],
};