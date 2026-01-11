import {View, Text, Pressable} from 'react-native'
import React from 'react'

type WhiteButtonProps = {
  title: string;
  onPress?: () => void;
};

const WhiteButton = ({title, onPress}: WhiteButtonProps) => {
    return (
        <View className="flex">
            <Pressable onPress={onPress} className="bg-white px-16 py-4 rounded-3xl">
                <Text className="text-primaryTo font-bold text-center text-1xl">
                    {title}
                </Text>
            </Pressable>
        </View>
    )
}

export default WhiteButton;
