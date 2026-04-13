/**
 * Dashboard layout and widget type defintions
 *
 * This file defines the structural model for how the dashboard
 * is composed and rendered.
 */

//Visual size of the widgets on the dashboard grid
export type Variant = "small" | "large";

//Supported widget categories, kind of device represnted by tile.
export type TileKind =
    | "light"
    | "climate"
    | "fan"
    | "cover"
    | "camera"
    | "lock"
    | "media"
    | "sensor"
    | "ai"
    | "generic";

//A single dashboard tile configuration.
export type Tile = {
    id: string;
    title: string;
    kind: TileKind;
    entityId?: string;
    entityIds?: string[];
};

//Row layout models
//A row containing one full width tile.
export type FullRow = { id: string; type: "full"; variant: Variant; item: Tile };

//A row containing two equally-sized tiles.
export type TwoRow = { id: string; type: "two"; variant: Variant; items: [Tile, Tile] };

//A row containing a large tile on the left and two stacked small tiles on the right.
export type SplitRow = {
    id: string;
    type: "split";
    left: Tile & { variant: "large" };
    right: [(Tile & { variant: "small" }), (Tile & { variant: "small" })];
};

//A header used to group sections.
export type HeaderRow = { id: string; type: "header"; title: string; iconPath?: string };

//Any row that can appear in the dashboard layout.
export type DashboardRow = FullRow | TwoRow | SplitRow | HeaderRow;