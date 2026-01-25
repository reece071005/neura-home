{/*import { Icons } from "@/assets/illustrations/customMaterialIcons/index";

type Props = {
  name: keyof typeof Icons;
  focused?: boolean;
  size?: number;
};

export default function TabIcon({ name, focused, size = 26 }: Props) {
  const entry = Icons[name];

  // single-variant icons
  if ("default" in entry) {
    const Icon = entry.default;
    return <Icon width={size} height={size} />;
  }

  // filled / outline icons
  const Icon = focused ? entry.filled : entry.outline;
  return <Icon width={size} height={size} />;
}*/}

import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

type TabIconProps = {
  name: string;
  size?: number;
  color?: string;
};

export default function TabIcon({
                                  name,
                                  size = 26,
                                  color = "#000",
                                }: TabIconProps) {
  return <MaterialIcons name={name as any} size={size} color={color} />;
}
