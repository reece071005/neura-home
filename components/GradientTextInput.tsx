import React, { useMemo, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    returnKeyType,
    onSubmitEditing,
    maxLength,
}) => {
    const [focused, setFocused] = useState(false);

    const mode = useMemo(()=> {
        if (error) return "error";
        if (focused) return "focused";
    }, [error, focused]);

    const gradientColors = useMemo(() => {
        if (mode === "error") return ["#EF4444", "#EF4444"]; // red
        if (mode === "focused") return ["#3DC4E0", "#4985EE"]; // <-- replace with your primaryFrom/primaryTo
        return ["#E5E7EB", "#E5E7EB"]; // gray-200
    }, [mode]);

    return (
        <View className="w-full">
            {!!label && (
                <Text className="mb-2 text-textSecondary font-semibold">
                    {label}
                </Text>
            )}

            {/* "Gradient border" wrapper */}
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 30, padding: 2 }}
            >
                <View className="bg-white rounded-[30px] px-4 py-3">
                    <TextInput
                         placeholder={placeholder}
                         value={value}
                         onChangeText={onChangeText}
                         placeholderTextColor="#868686"
                         keyboardType={keyboardType}
                         autoCapitalize={autoCapitalize}
                         autoCorrect={autoCorrect}
                         secureTextEntry={secureTextEntry}
                         returnKeyType={returnKeyType}
                         onSubmitEditing={onSubmitEditing}
                         maxLength={maxLength}
                         onFocus={() => setFocused(true)}
                         onBlur={() => setFocused(false)}
                         className="text-black font-semibold"
                    />
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
