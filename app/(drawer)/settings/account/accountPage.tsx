import React, { useState, useCallback, useMemo } from "react";
import { router, useFocusEffect } from "expo-router";

import {
  Text,
  Pressable,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GradientButton from "@/components/GradientButton";

import { getUserProfile, UserProfile } from "@/lib/api/auth/getUserProfile";
import { getMyUserFace, deleteMyUserFace, UserFaceResponse } from "@/lib/api/faces";

// Template for account section card
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="px-6 pt-4">
      <Text className="text-primaryTo text-h3 font-bold">{title}</Text>
      <View className="mt-3 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {children}
      </View>
    </View>
  );
}

//Template for rows for account information
function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value?: string | null;
  isLast?: boolean;
}) {
  return (
    <View className={`px-4 py-4 ${!isLast ? "border-b border-gray-200" : ""}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-subtext text-textSecondary">{label}</Text>
          <Text className="text-subtext text-black mt-1" numberOfLines={1}>
            {value ?? "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Reset password button template
function OutlineButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="py-3 rounded-3xl items-center border border-gray-300"
      style={{ backgroundColor: "white" }}
    >
      <Text style={{ color: "#111827", fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}

export default function AccountPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [face, setFace] = useState<UserFaceResponse | null>(null);
  const [faceLoading, setFaceLoading] = useState(true);

  const [faceDeleting, setFaceDeleting] = useState(false);

  const faceUri = useMemo(() => {
    if (!face?.image_base64) return null;

    const s = face.image_base64.trim();
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("file://")) return s;
    if (s.startsWith("data:image/")) return s;

    return `data:image/jpeg;base64,${s}`;
  }, [face?.image_base64]);

  // Remove face function
  const handleRemoveFace = () => {
    Alert.alert(
      "Remove face profile",
      "Are you sure you want to remove your face image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setFaceDeleting(true);
              await deleteMyUserFace();
              setFace(null);
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Failed to remove face");
            } finally {
              setFaceDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Loading function
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      setLoading(true);
      setFaceLoading(true);

      (async () => {
        try {
          const p = await getUserProfile();
          if (mounted) setMe(p);
        } catch (e) {
          console.error(e);
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      (async () => {
        try {
          const f = await getMyUserFace();
          if (mounted) setFace(f);
        } catch {
          if (mounted) setFace(null);
        } finally {
          if (mounted) setFaceLoading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: "700" }}>Account</Text>
        </View>

        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

        {/* Loading Indicator */}
        {loading ? (
          <View className="pt-10 items-center">
            <ActivityIndicator />
            <Text className="mt-3 text-textSeconday">Loading profile…</Text>
          </View>
        ) : (
          <>
            {/* Account Info */}
            <SectionCard title="My account">
              <InfoRow label="Username" value={me?.username} />
              <InfoRow label="Email" value={me?.email} />
              <InfoRow label="Role" value={me?.role ?? "resident"} isLast />
            </SectionCard>

            {/* Change password */}
            <SectionCard title="Security">
              <View className="px-4 py-4">
                <Text className="text-hint text-textSecondary">
                  Change your password to keep your account secure.
                </Text>

                <View className="mt-3">
                  <OutlineButton
                    title="Reset password"
                    onPress={() => router.push("/settings/account/resetPassword")}
                  />
                </View>
              </View>
            </SectionCard>

            {/* Face Profile  */}
            <SectionCard title="Face profile">
              <View className="px-4 py-4">
                {faceLoading ? (
                  <ActivityIndicator />
                ) : face ? (
                  <View className="items-center mb-4">
                    {faceUri ? (
                      <Image
                        source={{ uri: faceUri }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 60,
                          borderWidth: 2,
                          borderColor: "#E5E7EB",
                        }}
                      />
                    ) : null}

                    <Text className="mt-2 text-subtext text-textSecondary">{face.name}</Text>
                  </View>
                ) : (
                  <Text className="text-hint text-textSecondary mb-3">
                    Upload a face image so Neura Home can recognise you for personalised automation.
                  </Text>
                )}

                <GradientButton
                  title={face ? "Update face image" : "Upload face image"}
                  onPress={() => router.push("/settings/account/uploadFace")}
                />

                {/* Remove face image button */}
                {face && (
                  <View className="mt-4 items-center">
                    {faceDeleting ? (
                      <ActivityIndicator />
                    ) : (
                      <Pressable onPress={handleRemoveFace} hitSlop={10}>
                        <Text style={{ color: "#EF4444", fontWeight: "600" }}>
                          Remove face image
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {!face && (
                  <Text className="mt-3 text-hint text-textSecondary">
                    Tip: Use a clear, front-facing photo in good lighting.
                  </Text>
                )}
              </View>
            </SectionCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
