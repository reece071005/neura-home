export type CategoryKey =
    | "lights"
    | "fans"
    | "switches"
    | "blinds"
    | "airConditioners"
    | "mediaPlayers"
    | "cameras"
    | "sensors";

export function kindToCategory(kind: string): CategoryKey | null {
    switch (kind) {
        case "light":
            return "lights";
        case "fan":
            return "fans";
        case "switch":
            return "switches";
        case "cover":
            return "blinds";
        case "climate":
             return "airConditioners";
        case "media_player":
            return "mediaPlayers";
        case "camera":
            return "cameras";
        case "sensor":
        case "binary_sensor":
            return "sensors";
        default:
            return null;
    }
}
