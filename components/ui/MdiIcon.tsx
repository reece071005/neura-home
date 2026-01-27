import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  path: string;
  size?: number;
  color?: string;
};

export default function MdiIcon({ path, size = 30, color = "#111" }: Props) {
  return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d={path} fill={color} />
      </Svg>
  );
}
