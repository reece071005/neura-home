import {View, Text, Pressable} from 'react-native'
import React from 'react'
import GradientSearch from "@/assets/illustrations/customMaterialIcons/gradientSearch.svg";
import {MaterialIcons} from "@expo/vector-icons";
/*
type WhiteButtonProps = {
  title: string;
  onPress?: () => void;
};
*/

const BurgerSearchWidget = ({title, onPress}: WhiteButtonProps) => {
    return (
            <GradientSearch height={24} width={24}></GradientSearch>
    )
}

export default GradientSearch;
