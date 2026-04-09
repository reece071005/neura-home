import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  getCachedVisionNotification,
  getImageUri,
  getVisionNotificationById,
  VisionNotification,
} from "@/lib/api/visionNotifications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ---------------- Helpers ---------------- */

const formatCameraName = (name?: string) => {
  if (!name) return "Unknown Camera";
  return name
    .replace(/^camera\./, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/* ---------------- Detail Row ---------------- */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          backgroundColor: "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialIcons name={icon} size={17} color="#374151" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginBottom: 1 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 14, color: "#111827", fontWeight: "500" }} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ---------------- Screen ---------------- */

export default function VisionNotificationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationId = id ? Number(id) : NaN;
  const hasValidId = Number.isFinite(notificationId);
  const initialCached = Number.isFinite(notificationId)
    ? getCachedVisionNotification(notificationId)
    : null;

  const [notification, setNotification] = useState<VisionNotification | null>(initialCached);
  const [loading, setLoading] = useState(hasValidId && !initialCached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidId) {
      setLoading(false);
      setError("Invalid notification ID");
      return;
    }

    const cached = getCachedVisionNotification(notificationId);
    if (cached) {
      setNotification(cached);
      setLoading(false);
    }

    (async () => {
      try {
        if (!cached) setLoading(true);
        const data = await getVisionNotificationById(notificationId);
        setNotification(data);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load notification");
      } finally {
        setLoading(false);
      }
    })();
  }, [hasValidId, notificationId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !notification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <Header />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="error-outline" size={40} color="#EF4444" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 12 }}>
            Could not load snapshot
          </Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4, textAlign: "center" }}>
            {error ?? "Notification not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="Detection Snapshot" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Snapshot */}
        <View
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH * 0.5625,
            backgroundColor: "#111827",
          }}
        >
          {notification.image ? (
            <Image
              source={{ uri: getImageUri(notification.image) }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <MaterialIcons name="broken-image" size={36} color="#4B5563" />
              <Text style={{ fontSize: 13, color: "#6B7280" }}>Snapshot unavailable</Text>
            </View>
          )}

          {/* Detection badge */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "rgba(239,68,68,0.9)",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white" }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "white" }}>DETECTION</Text>
          </View>
        </View>

        {/* Info panel */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", lineHeight: 24 }}>
            {notification.message}
          </Text>

          <View style={{ marginTop: 20 }}>
            <DetailRow icon="videocam" label="Camera" value={formatCameraName(notification.camera_entity)} />
            <DetailRow icon="schedule" label="Detected at" value={formatFullDate(notification.created_at)} />
          </View>

          <Pressable
            onPress={() => router.push({ pathname: "/(drawer)/(tabs)/cameraDashboard" })}
            style={({ pressed }) => ({
              marginTop: 28,
              backgroundColor: pressed ? "#1F2937" : "#111827",
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            })}
          >
            <MaterialIcons name="videocam" size={18} color="white" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "white" }}>View Live Feed</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Back header ---------------- */

function Header({ title = "Back" }: { title?: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 8,
      }}
    >
      <Pressable
        onPress={() => router.replace({ pathname: "/notifications/notifications" })}
        android_ripple={{ color: "#E5E7EB", borderless: true }}
        disabled={router.canGoBack() === false}
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <MaterialIcons name="arrow-back" size={24} color="#111827" />
      </Pressable>
      <Text style={{ fontSize: 17, fontWeight: "700", color: "#111827" }}>{title}</Text>
    </View>
  );
}
