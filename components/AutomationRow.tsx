import { View, Text, Pressable, Switch } from "react-native";
import React from "react";

type IconComponent = React.ComponentType<{ width?: number; height?: number }>;

type AutomationRowProps = {
    title: string;
    Icon: IconComponent;
    EditIcon?: IconComponent;
    AddIcon?: IconComponent;
    enabled?: boolean;
    showToggle?: boolean;
    onToggle?: () => void;
    onEdit?: () => void;
    onAdd?: () => void;
};

export default function AutomationRow({
                                          title,
                                          Icon,
                                          EditIcon,
                                          AddIcon,
                                          enabled = false,
                                          showToggle = false,
                                          onToggle,
                                          onEdit,
                                          onAdd,
                                      }: AutomationRowProps) {
    return (
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <View className="flex-row items-center gap-x-7">
                <Icon width={22} height={22} />
                <Text className="font-poppins font-semibold">{title}</Text>
            </View>

            <View className="flex-row items-center gap-x-4">
                {showToggle && (
                    <Switch value={enabled} onValueChange={onToggle} />
                )}

                {onAdd && AddIcon && (
                    <Pressable onPress={onAdd}>
                        <AddIcon width={20} height={20} />
                    </Pressable>
                )}

                {onEdit && EditIcon && (
                    <Pressable onPress={onEdit}>
                        <EditIcon width={18} height={18} />
                    </Pressable>
                )}
            </View>
        </View>
    );
}
