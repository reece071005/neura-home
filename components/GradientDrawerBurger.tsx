import { Pressable } from 'react-native';
import { useNavigation } from 'expo-router'
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import GradientBurgerMenu from "@/assets/illustrations/customMaterialIcons/gradientBurgerMenu.svg"

type Props = {
  size?: number;
}

export default function GradientDrawerBurger({size=28}: Props) {
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();
  return (
      <Pressable
          onPress={() => navigation.openDrawer()}
          hitSlop={12}
          style={{ padding: 8 }}
      >
        <GradientBurgerMenu width={size} height={size}  />
      </Pressable>
  );
}