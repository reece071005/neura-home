import * as mdi from "@mdi/js";
import type {ApiDevice} from "@/lib/api/devices";
import type {TileKind, WidgetSize} from "@/lib/storage/dashboardWidgetStore";

// Editing Tile or Header
export type AddMode = "tile" | "header";

//Tile Kind Options
export const kindOptions: TileKind[] = [
    "light",
    "climate",
    "fan",
    "cover",
    "camera",
    "sensor",
    "ai",
];

//Tile size Options
export const sizeOptions: WidgetSize[] = ["small", "large"];

export const SUPPORTED_SIZES_BY_KIND: Record<TileKind, WidgetSize[]> = {
    light: ["small", "large"],
    climate: ["large"],
    fan: ["small"],
    cover: ["small"],
    camera: ["large"],
    sensor: ["small"],
    ai: ["small"],
};

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
    camera: ["camera"],
    sensor: ["binary_sensor", "sensor"],
    ai: [],
};
