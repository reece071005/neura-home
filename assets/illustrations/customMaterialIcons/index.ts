// Home
import HomeFilled from "@/assets/illustrations/customMaterialIcons/full/gradientHomeFull.svg";
import HomeOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientHomeOutline.svg";

// Power
import PowerFilled from "@/assets/illustrations/customMaterialIcons/full/gradientPowerFull.svg";
import PowerOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientPowerOutline.svg";

// Camera
import CameraFilled from "@/assets/illustrations/customMaterialIcons/full/gradientCameraFull.svg";
import CameraOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientCameraOutline.svg";

// Light
import LightFilled from "@/assets/illustrations/customMaterialIcons/full/gradientLightFull.svg";
import LightOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientLightOutline.svg";

// Temperature
import TemperatureFilled from "@/assets/illustrations/customMaterialIcons/full/gradientTemperatureFull.svg";
import TemperatureOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientTemperatureOutline.svg";

// Microphone
import MicrophoneFilled from "@/assets/illustrations/customMaterialIcons/full/gradientMicrophoneFull.svg";
import MicrophoneOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientMicrophoneOutline.svg";

// Edit
import EditFilled from "@/assets/illustrations/customMaterialIcons/full/gradientEditFull.svg";
import EditOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientEditOutline.svg";

//Search
import Search from "@/assets/illustrations/customMaterialIcons/gradientSearch.svg";

//Burger Menu
import BurgerMenu from "@/assets/illustrations/customMaterialIcons/gradientBurgerMenu.svg";

//History
import HistoryOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientHistoryOutline.svg"

//Automations
import AutomationsOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientAutomationsOutline.svg"

//Notifications
import NotificationsOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientNotificationsOutline.svg"

//Devices
import DevicesOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientDevicesOutline.svg"

//Settings
import SettingsOutline from "@/assets/illustrations/customMaterialIcons/outline/gradientSettingsOutline.svg"

export const Icons = {
  home: {
    filled: HomeFilled,
    outline: HomeOutline,
  },
  power: {
    filled: PowerFilled,
    outline: PowerOutline,
  },
  camera: {
    filled: CameraFilled,
    outline: CameraOutline,
  },
  light: {
    filled: LightFilled,
    outline: LightOutline,
  },
  temperature: {
    filled: TemperatureFilled,
    outline: TemperatureOutline,
  },
  microphone: {
    filled: MicrophoneFilled,
    outline: MicrophoneOutline,
  },
  edit: {
    filled: EditFilled,
    outline: EditOutline,
  },

  // single-variant icons
  history:{
    default: HistoryOutline,
  },
  automations:{
    default: AutomationsOutline,
  },
  notifications:{
    default: NotificationsOutline,
  },
  devices: {
    default: DevicesOutline,
  },
  settings: {
    default: SettingsOutline
  },
  search: {
    default: Search,
  },
  burgerMenu: {
    default: BurgerMenu,
  },
} as const;


export type IconName = keyof typeof Icons;
export type IconVariant = "filled" | "outline";