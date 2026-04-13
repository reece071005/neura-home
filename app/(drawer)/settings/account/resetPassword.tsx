import React, { useState } from "react";
import { Text, View, Platform, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { mdiArrowLeft } from "@mdi/js";

import GradientButton from "@/components/general/GradientButton";
import GradientTextInput from "@/components/general/GradientTextInput";
import MdiIcon from "@/components/general/MdiIcon";

import { changePasswordSelf } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const onSubmit = async () => {
    setFormError(null);
    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    // Input checks
    let hasError = false;

    if (!oldPassword) {
      setOldPasswordError("Current password is required");
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      hasError = true;
    } else if (newPassword.length < 8) {
      setNewPasswordError("Password must be at least 8 characters");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password");
      hasError = true;
    } else if (newPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);

      await changePasswordSelf(oldPassword, newPassword, confirmPassword);

      setSuccess(true);
      setTimeout(() => router.replace("/settings/account/accountPage"), 1500);
    } catch (err: any) {
      const msg =
          typeof err?.message === "string"
              ? err.message
              : "Something went wrong. Please try again.";

      const lower = msg.toLowerCase();

      if (lower.includes("current") || lower.includes("old") || lower.includes("incorrect")) {
        setOldPasswordError(msg);
        return;
      }

      if (lower.includes("password")) {
        setNewPasswordError(msg);
        return;
      }

      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={{flex: 1, backgroundColor: "white"}}>
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 16,
          paddingBottom: 12,
          paddingHorizontal: 16
        }}>
          <Pressable onPress={() => router.replace("/settings/account/accountPage")} hitSlop={8}>
            <MdiIcon path={mdiArrowLeft} size={24} color="#4985EE"/>
          </Pressable>

          <Text style={{flex: 1, fontSize: 22, fontWeight: "700", textAlign: "center"}}>Reset Password</Text>

          <View style={{width: 24}}/>
        </View>

        <View style={{height: 1, backgroundColor: "#E5E7EB"}}/>

        <View className="flex-1 bg-white px-6 pt-6">
          <KeyboardAwareScrollView
              keyboardShouldPersistTaps="always"
              enableOnAndroid
              extraScrollHeight={16}
              extraHeight={Platform.OS === "ios" ? 16 : 120}
              contentContainerStyle={{paddingBottom: 24}}
              showsVerticalScrollIndicator={false}
          >
            {/* Subheading + feedback */}
            <View className="gap-1 mb-2">
              <Text className="text-primaryTo font-bold text-h3">Reset password</Text>
              <Text className="text-textSecondary text-body font-semibold">
                Choose a strong new password for your account
              </Text>

              {formError ? (
                  <Text className="text-red-500 font-medium mt-2">{formError}</Text>
              ) : null}

              {success ? (
                  <Text className="text-green-500 font-medium mt-2">
                    Password updated! Taking you back…
                  </Text>
              ) : null}
            </View>

            {/* Reset Password Form */}
            <View className="pt-4">
              <View className="w-full gap-1">
                <GradientTextInput
                    label="Current password"
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                    showPasswordToggle
                    autoCapitalize="none"
                    error={!!oldPasswordError}
                    errorText={oldPasswordError}
                    returnKeyType="next"
                />

                <GradientTextInput
                    label="New password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="At least 8 characters"
                    secureTextEntry
                    showPasswordToggle
                    autoCapitalize="none"
                    error={!!newPasswordError}
                    errorText={newPasswordError}
                    returnKeyType="next"
                />

                <GradientTextInput
                    label="Confirm new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat new password"
                    secureTextEntry
                    showPasswordToggle
                    autoCapitalize="none"
                    error={!!confirmPasswordError}
                    errorText={confirmPasswordError}
                    returnKeyType="done"
                />
              </View>

              <View className="w-full mt-4">
                <GradientButton
                    title={loading ? "Updating..." : "Update password"}
                    onPress={onSubmit}
                    disabled={loading || success}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
  );
}