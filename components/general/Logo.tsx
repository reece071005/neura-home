import React from "react";
import { View } from "react-native";

import LogoGradientSquareNoText from '@/assets/logo/svg/logoGradientSquareNoText.svg';
import LogoWhiteSquareWithText from '@/assets/logo/svg/logoWhiteSquareWithText.svg';

type LogoColor = "white" | "gradient";
type LogoShape = "square" | "rect";
type LogoSquareText = "with" | "none";

type LogoProps =
  | {
      color?: LogoColor;
      shape?: "square";
      text?: LogoSquareText;
      size?: number;
      width?: never;
      height?: never;
      className?: string;
    }
  | {
      color?: LogoColor;
      shape: "rect";
      text?: never;
      width?: number;
      height?: number;
      size?: never;
      className?: string;
    };

const REGISTRY = {
  gradient: {
    square: {
      none: LogoGradientSquareNoText,
    },
    rect: {
    },
  },
  white: {
    square: {
      with: LogoWhiteSquareWithText,
    },
    rect: {
    },
  },
} as const;

export default function Logo(props: LogoProps) {
  const color: LogoColor = props.color ?? "gradient";
  const shape: LogoShape = props.shape ?? "square";

  let LogoComponent: React.ComponentType<{ width: number; height: number }> | undefined;

  if (shape === "square") {
    const text: LogoSquareText = (props as any).text ?? "none";

    LogoComponent = (REGISTRY as any)?.[color]?.square?.[text];

    if (!LogoComponent) {
      LogoComponent =
        (REGISTRY as any)?.[color]?.square?.none ??
        (REGISTRY as any)?.[color]?.square?.with;
    }

    if (!LogoComponent) return null;

    const size = (props as any).size ?? 120;

    return (
      <View
        className={(props as any).className}
        style={{ width: size, height: size }}
      >
        <LogoComponent width={size} height={size} />
      </View>
    );
  }

  LogoComponent = (REGISTRY as any)?.[color]?.rect?.base;

  if (!LogoComponent) {
    const fallback =
      (REGISTRY as any)?.[color]?.square?.none ??
      (REGISTRY as any)?.[color]?.square?.with;

    if (!fallback) return null;

    const size = 120;
    return (
      <View
        className={(props as any).className}
        style={{ width: size, height: size }}
      >
        {React.createElement(fallback, { width: size, height: size })}
      </View>
    );
  }

  const width = (props as any).width ?? 180;
  const height = (props as any).height ?? 60;

  return (
    <View
      className={(props as any).className}
      style={{ width, height }}
    >
      <LogoComponent width={width} height={height} />
    </View>
  );
}
