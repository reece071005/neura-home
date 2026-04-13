// SmallCoverTile.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { mdiBlinds } from '@mdi/js';

import Card from "@/components/dashboard/Card";
import MdiIcon from "@/components/general/MdiIcon";
import Slider from "@react-native-community/slider";

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

type Props = {
  title: string;
  position?: number;
  onChangePosition?: (pct: number) => void;
  showBlueBorder?: boolean;
};

export default function SmallCoverTile({title, position, onChangePosition, showBlueBorder = false, }: Props) {
  const pct = clamp(Math.round(position ?? 0), 0, 100)
  const isOpen = pct>0;

  const subtitle = useMemo(() => {
      if (pct === 0) return 'Closed'
      if (pct === 100) return 'Open'
    return`Open - ${pct}%`
    }, [pct]);

  return (
      <Card
          variant="small"
          className={[
              showBlueBorder ? "border border-blue-500" : "",
              ].join(" ")}
      >
        <View className="flex-1">
          <View className="flex-row items-center">
            <View className="pr-2 pt-1">
              <MdiIcon path={mdiBlinds} size={30} color={isOpen ? "#4985EE" : "#7A7A7A"} />
            </View>
            <View className="flex-1 pr-[24px]">
              <Text numberOfLines={1} className="text-body font-medium text-black">
                {title}
              </Text>
              <Text
                  numberOfLines={1}
                  className="text-subtext font-medium"
                  style={{ color: isOpen ? "#4985EE" : "#7A7A7A" }}
              >
                {subtitle}
              </Text>
            </View>
          </View>
          {/* Slider */}
          <View className="mt-1">
            <Slider
                value={pct}
                minimumValue={0}
                maximumValue={100}
                step={1}
                onSlidingComplete={(v) => onChangePosition?.(clamp(Math.round(v), 0, 100))}
                minimumTrackTintColor="#4985EE"
                maximumTrackTintColor="#7A7A7A"
                thumbTintColor={isOpen ? "#4985EE": "#7A7A7A"}
            />
          </View>
        </View>
      </Card>
  );
}
