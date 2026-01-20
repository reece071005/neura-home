// app/(drawer)/(tabs)/mainDashboard.tsx
import React from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "@/components/ui/Card";

type Variant = "small" | "large";

type FullRow = {
    id: string;
    type: "full";
    variant: Variant;
    item: { title: string };
};

type TwoRow = {
    id: string;
    type: "two";
    variant: Variant;
    items: [{ title: string }, { title: string }];
};

// ✅ big card next to two stacked smalls
type SplitRow = {
    id: string;
    type: "split";
    left: { variant: "large"; title: string };
    right: [{ variant: "small"; title: string }, { variant: "small"; title: string }];
};

type DashboardRow = FullRow | TwoRow | SplitRow;

const GAP = 8;

const LAYOUT: DashboardRow[] = [
    { id: "ai", type: "full", variant: "large", item: { title: "AI Suggestions" } },

    { id: "row1", type: "two", variant: "small", items: [{ title: "Light" }, { title: "AC" }] },

    {
        id: "row_split",
        type: "split",
        left: { variant: "large", title: "Blinds" },
        right: [
            { variant: "small", title: "Fan" },
            { variant: "small", title: "Locks" },
        ],
    },

    { id: "cam", type: "full", variant: "large", item: { title: "Camera" } },
    {
        id: "row_split",
        type: "split",
        left: {variant: "large", title: "Blinds"},
        right: [
            {variant: "small", title: "lock"},
            {variant: "small", title: "light"},
        ],
    }
];

function TileTitle({ title }: { title: string }) {
    return <Text className="text-black font-bold text-center">{title}</Text>;
}

function RenderRow({ row }: { row: DashboardRow }) {
    switch (row.type) {
        case "full":
            return (
                <Card variant={row.variant}>
                    <TileTitle title={row.item.title} />
                </Card>
            );

            case "two":
                return (
                    <View className={`flex-row`} style={{ gap: GAP }}>
                        <View className="flex-1">
                            <Card variant={row.variant}>
                                <TileTitle title={row.items[0].title} />
                            </Card>
                        </View>
                        <View className="flex-1">
                            <Card variant={row.variant}>
                                <TileTitle title={row.items[1].title} />
                            </Card>
                        </View>
                    </View>
                );

                case "split":
                    return (
                        <View className="flex-row" style={{ gap: GAP }}>
                            {/* Left: one large */}
                            <View className="flex-1">
                                <Card variant={row.left.variant}>
                                    <TileTitle title={row.left.title} />
                                </Card>
                            </View>

                            {/* Right: two small stacked */}
                            <View className="flex-1" style={{ gap: GAP }}>
                                <Card variant={row.right[0].variant}>
                                    <TileTitle title={row.right[0].title} />
                                </Card>
                                <Card variant={row.right[1].variant}>
                                    <TileTitle title={row.right[1].title} />
                                </Card>
                            </View>
                        </View>
                    );
                    default:
                        return null;
    }
}

export default function MainDashboard() {
    return (
        <SafeAreaView edges={["top"]} className="flex-1">
            <ScrollView
                className="flex-1 "
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 64 }}
                overScrollMode={"never"}
                bounces={false}
            >
                <View className="px-4 pt-6" style={{ gap: GAP }}>
                    {LAYOUT.map((row) => (
                        <RenderRow key={row.id} row={row} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
