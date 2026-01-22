import {View, Text, Pressable} from 'react-native'
import React from 'react'

type WhiteButtonProps = {
  title: string;
  onPress?: () => void;
};

const WhiteButton = ({title, onPress}: WhiteButtonProps) => {
    return (
        <Pressable onPress={onPress} className="bg-white px-16 py-4 rounded-3xl shadow-lg">
            <Text className="text-primaryTo text-button font-bold text-center">
                {title}
            </Text>
        </Pressable>
    )
}

export default WhiteButton;
