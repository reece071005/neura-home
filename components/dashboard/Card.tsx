import React from "react";
import {View, Pressable} from 'react-native'
import clsx from "clsx";

type CardProps = {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "small" | "large";
    disabled?: boolean;
    className?: string;
    noPadding?: boolean;
    transparent?: boolean;
    allowOverflow?: boolean;
}

const Card = ({
    children,
    onPress,
    variant = "small",
    disabled = false,
    className,
    noPadding = false,
    transparent = false,
    allowOverflow = false,
}: CardProps) => {
    const base = clsx (
       "rounded-2xl shadow-md",
        !transparent && "bg-white",
        !allowOverflow && "overflow-hidden"
    )

    const padding = noPadding
      ? { small: "h-[102px]", large: "h-[180px]" }[variant]
      : { small: "h-[86px] p-2", large: "h-[180px] p-4" }[variant];

    const content = (
        <View
            className={clsx(
                base,
                padding,
                disabled && "opacity-50",
                className
            )}
        >
            {children}
        </View>
    )

    if (!onPress) return content;

    return (
        <Pressable
            onPress={onPress}
            className="active:scale-[0.98]"
        >
            {content}
        </Pressable>
    );
}

export default Card;
