import React, { useMemo, useState } from 'react';
import {View, Text, TextInput, Pressable} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const GradientTextInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    helperText,
    error,
    keyboardType = "default",
    autoCapitalize = "none",
    autoCorrect = false,
    secureTextEntry = false,
    showPasswordToggle = false,
    returnKeyType,
    onSubmitEditing,
    maxLength,
}) => {
    const [focused, setFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(true);

    const mode = useMemo(()=> {
        if (error) return "error";
        if (focused) return "focused";
    }, [error, focused]);

    const gradientColors = useMemo(() => {
        if (mode === "error") return ["#EF4444", "#EF4444"]; // red
        if (mode === "focused") return ["#3DC4E0", "#4985EE"]; // <-- replace with your primaryFrom/primaryTo
        return ["#C4C4C4", "#C4C4C4"]; // gray-200
    }, [mode]);

    const isPasswordField = secureTextEntry || showPasswordToggle;
    const effectiveSecure = isPasswordField ? passwordHidden : false;

    return (
        <View className="w-full">
            {!!label && (
                <Text className="mb-2 text-textSecondary font-semibold pl-6">
                    {label}
                </Text>
            )}

            {/* "Gradient border" wrapper */}
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 32, padding: 2 }}
            >
                <View className="bg-white rounded-[30px] px-4 py-2">
                    <View className="flex-row items-center">
                        {isPasswordField && (
                            <Pressable
                                onPress={() => setPasswordHidden((v) => !v)}
                                hitSlop={10}
                                className="pr-3"
                                >
                                <MaterialIcons
                                    name={passwordHidden ? "visibility" : "visibility-off"}
                                    size={22}
                                    color="#868686"
                                />
                            </Pressable>
                        )}
                        <TextInput
                             placeholder={placeholder}
                             value={value}
                             onChangeText={onChangeText}
                             placeholderTextColor="#868686"
                             keyboardType={keyboardType}
                             autoCapitalize={autoCapitalize}
                             autoCorrect={autoCorrect}
                             secureTextEntry={effectiveSecure}
                             returnKeyType={returnKeyType}
                             onSubmitEditing={onSubmitEditing}
                             maxLength={maxLength}
                             onFocus={() => setFocused(true)}
                             onBlur={() => setFocused(false)}
                             className="flex-1 text-black font-semibold py-3"
                        />

                    </View>
                </View>
            </LinearGradient>
      {!!error ? (
        <Text className="mt-2 text-red-500 font-semibold">{error}</Text>
      ) : !!helperText ? (
        <Text className="mt-2 text-textSecondary font-semibold">{helperText}</Text>
      ) : null}
    </View>
  );
};
export default GradientTextInput
