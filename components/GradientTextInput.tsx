import React, { forwardRef, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const GradientTextInput = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      helperText,
      error,
      errorText,
      keyboardType = "default",
      autoCapitalize = "none",
      autoCorrect = false,
      secureTextEntry = false,
      showPasswordToggle = false,
      returnKeyType,
      onSubmitEditing,
      maxLength,

      // ✅ allow parent to hook focus/blur
      onFocus,
      onBlur,
      ...rest
    }: any,
    ref: any
  ) => {
    const [focused, setFocused] = useState(false);
    const [passwordHidden, setPasswordHidden] = useState(true);

    const mode = useMemo(() => {
      if (error) return "error";
      if (focused) return "focused";
      return "default";
    }, [error, focused]);

    const gradientColors = useMemo(() => {
      if (mode === "error") return ["#EF4444", "#EF4444"];
      if (mode === "focused") return ["#3DC4E0", "#4985EE"];
      return ["#C4C4C4", "#C4C4C4"];
    }, [mode]);

    const isPasswordField = secureTextEntry || showPasswordToggle;
    const effectiveSecure = isPasswordField ? passwordHidden : false;

    // ✅ always reserve message space so nothing shifts
    const message = error && errorText ? errorText : helperText ?? " ";
    const messageIsError = !!(error && errorText);

    return (
      <View className="w-full">
        {!!label && (
          <Text className="mb-0.5 text-textSecondary font-semibold pl-6">
            {label}
          </Text>
        )}

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
                  className="pr-2"
                >
                  <MaterialIcons
                    name={passwordHidden ? "visibility" : "visibility-off"}
                    size={22}
                    color="#868686"
                  />
                </Pressable>
              )}

              <TextInput
                ref={ref} // ✅ THIS is the key
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
                className="flex-1 text-black font-semibold py-3"
                onFocus={(e) => {
                  setFocused(true);
                  onFocus?.(e); // ✅ bubble up
                }}
                onBlur={(e) => {
                  setFocused(false);
                  onBlur?.(e); // ✅ bubble up
                }}
                {...rest}
              />
            </View>
          </View>
        </LinearGradient>

        <Text
          className={`mt-1 pl-6 font-semibold ${
            messageIsError ? "text-textAlert" : "text-textSecondary"
          }`}
          style={{ minHeight: 20 }}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    );
  }
);

export default GradientTextInput;


