import { Icons } from "@/assets/illustrations/customMaterialIcons/index";

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
}