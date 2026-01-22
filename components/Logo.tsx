import React from "react";
import { View } from "react-native";

// Your current SVGs (imported as components)
import LogoGradientSquareNoText from '@/assets/logo/svg/logoGradientSquareNoText.svg';
import LogoWhiteSquareWithText from '@/assets/logo/svg/logoWhiteSquareWithText.svg';

/**
 * Variants:
 * - color: white | gradient
 * - shape: square | rect
 * - text: with | none  (ONLY applies to square)
 *
 * Add new imports later and register them in REGISTRY.
 */

type LogoColor = "white" | "gradient";
type LogoShape = "square" | "rect";
type LogoSquareText = "with" | "none";

type LogoProps =
  | {
      color?: LogoColor;
      shape?: "square";
      text?: LogoSquareText;
      size?: number; // square size (width=height)
      width?: never;
      height?: never;
      className?: string;
    }
  | {
      color?: LogoColor;
      shape: "rect";
      // text doesn't apply to rect
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
      // with: LogoGradientSquareWithText, // add later
    },
    rect: {
      // base: LogoGradientRect, // add later
    },
  },
  white: {
    square: {
      with: LogoWhiteSquareWithText,
      // none: LogoWhiteSquareNoText, // add later
    },
    rect: {
      // base: LogoWhiteRect, // add later
    },
  },
} as const;

export default function Logo(props: LogoProps) {
  const color: LogoColor = props.color ?? "gradient";
  const shape: LogoShape = props.shape ?? "square";

  // Resolve component
  let LogoComponent: React.ComponentType<{ width: number; height: number }> | undefined;

  if (shape === "square") {
    const text: LogoSquareText = (props as any).text ?? "none";

    // Exact match
    LogoComponent = (REGISTRY as any)?.[color]?.square?.[text];

    // Fallbacks if you haven't added a specific variant yet
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

  // rect
  LogoComponent = (REGISTRY as any)?.[color]?.rect?.base;

  // If rect not available yet, gracefully fall back to a square logo
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
