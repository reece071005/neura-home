import {View, Text, Pressable} from 'react-native'
import React from 'react'
import GradientDrawerBurger from "@/components/GradientDrawerBurger";
import GradientSearch from "@/components/GradientSearch";

const BurgerSearchWidget = () => {
    return (
        <View className="rounded-3xl gap-1 bg-white flex-row items-center justify-center p-1.5">
            <GradientDrawerBurger></GradientDrawerBurger>
            <GradientSearch></GradientSearch>
        </View>
    )
}

export default BurgerSearchWidget;
