import {View, Text, Pressable} from 'react-native'
import { LinearGradient } from "expo-linear-gradient";
import React from 'react'

type GradientButtonProps = {
  title: string;
  onPress?: () => void;
};

const GradientButton = ({title, onPress}: GradientButtonProps) => {
    return (
        <Pressable onPress={onPress} className="rounded-3xl overflow-hidden shadow-lg">
            <LinearGradient
              colors={["#3DC4E0", "#4985EE"]}
              locations={[0, 0.44]}
              className="px-16 py-4"
            >
                <Text className="text-textWhite text-button font-bold text-center">
                    {title}
                </Text>
            </LinearGradient>
        </Pressable>
    )
}

export default GradientButton;