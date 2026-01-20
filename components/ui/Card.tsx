import React from "react";
import {View, Pressable} from 'react-native'
import clsx from "clsx";

type CardProps = {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: "small" | "large";
    disabled?: boolean;
    className?: string;
}

const Card = ({
    children,
    onPress,
    variant = "small",
    disabled = false,
    className,
}: CardProps) => {
    const base = "bg-white rounded-2xl shadow-md";

    const padding = {
        small: "p-4 h-[86px]",
        large: "p-5 h-[180px]",
    }[variant];

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
