import {View, Text, Pressable} from 'react-native'
import React from 'react'
import GradientDrawerBurger from "@/components/GradientDrawerBurger";

const BurgerWidget = () => {
    return (
        <View className="rounded-3xl gap-1 bg-white flex-row items-center justify-center p-1.5">
            <GradientDrawerBurger></GradientDrawerBurger>
        </View>
    )
}

export default BurgerWidget;
