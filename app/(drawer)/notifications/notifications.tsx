//notification.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {ActivityIndicator, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import { getImageUri, getVisionNotifications, VisionNotification } from "@/lib/api/notifications/visionNotifications";
import { getAiNotifications, AiNotification } from "@/lib/api/notifications/aiNotifications";

// Types
type CombinedNotification =
  | (VisionNotification & { source: "vision" })
  | (AiNotification & { source: "ai" });

// Constants
const PAGE_SIZE = 10;

// Helpers
const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatCameraName = (name?: string) => {
  if (!name) return "Unknown Camera";
  return name
    .replace(/^camera\./, "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// Vision Notification Card
function VisionNotificationCard({
  item,
  isRead,
  onMarkRead,
}: {
  item: VisionNotification & { source: "vision" };
  isRead: boolean;
  onMarkRead: (item: VisionNotification & { source: "vision" }) => void;
}) {
  const onPress = () => {
    onMarkRead(item);
    router.push({
      pathname: "/notifications/visionNotificationDetail",
      params: { id: String(item.id) },
    });
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isRead ? "#E5E7EB" : "#D1D5DB",
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        {/* Unread indicator strip */}
        <View style={{ width: 3, backgroundColor: isRead ? "transparent" : "#EF4444" }} />

        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            {/* Thumbnail */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                backgroundColor: "#F3F4F6",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {item.image ? (
                <Image
                  source={{ uri: getImageUri(item.image) }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <MaterialIcons name="image" size={20} color="#D1D5DB" />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: isRead ? "500" : "700", color: "#111827", flex: 1 }}
                  numberOfLines={1}
                >
                  {item.message}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <MaterialIcons name="videocam" size={13} color="#9CA3AF" />
                <Text style={{ fontSize: 12, color: "#9CA3AF" }} numberOfLines={1}>
                  {formatCameraName(item.camera_entity)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "#FEF2F2" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#EF4444" }}>Detection</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>View clip →</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// AI Notification Card
function AiNotificationCard({
  item,
  isRead,
  onMarkRead,
}: {
  item: AiNotification & { source: "ai" };
  isRead: boolean;
  onMarkRead: (item: AiNotification & { source: "ai" }) => void;
}) {
  const onPress = () => {
    onMarkRead(item);
    router.push({
      pathname: "/notifications/aiNotificationDetail",
      params: { id: String(item.id) },
    });
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isRead ? "#E5E7EB" : "#D1D5DB",
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        <View style={{ width: 3, backgroundColor: isRead ? "transparent" : "#6366F1" }} />

        <View style={{ flex: 1, padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
            {/* Thumbnail */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 10,
                backgroundColor: "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MaterialIcons name="auto-awesome" size={24} color="#6366F1" />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: isRead ? "500" : "700", color: "#111827", flex: 1 }}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>
                <Text style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>
                  {formatRelativeTime(item.created_at)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <MaterialIcons name="smart-toy" size={13} color="#9CA3AF" />
                <Text style={{ fontSize: 12, color: "#9CA3AF" }} numberOfLines={1}>
                  AI Assistant
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "#EEF2FF" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: "#6366F1" }}>AI Automation</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827" }}>View details →</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Screen
export default function Notifications() {
  const [items, setItems] = useState<CombinedNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"unread" | "read">("unread");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track pagination offsets separately
  const [visionOffset, setVisionOffset] = useState(0);
  const [aiOffset, setAiOffset] = useState(0);

  const hasUserScrolledRef = useRef(false);
  const lastYRef = useRef(0);
  const loadingMoreRef = useRef(false); // ref copy prevents stale closure issues

  // Initial load or pull-to-refresh
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [vision, ai] = await Promise.all([
        getVisionNotifications(0, PAGE_SIZE),
        getAiNotifications(0, PAGE_SIZE),
      ]);

      const merged: CombinedNotification[] = [
        ...vision.map((v) => ({ ...v, source: "vision" as const })),
        ...ai.map((a) => ({ ...a, source: "ai" as const })),
      ];

      merged.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setItems(merged);
      setVisionOffset(vision.length);
      setAiOffset(ai.length);
      setHasMore(vision.length === PAGE_SIZE || ai.length === PAGE_SIZE);

    } catch (e: any) {
      setError(e?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load the next page when the user scrolls near the bottom
  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || refreshing || loading) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const [vision, ai] = await Promise.all([
        getVisionNotifications(visionOffset, PAGE_SIZE),
        getAiNotifications(aiOffset, PAGE_SIZE),
      ]);

      const newMerged: CombinedNotification[] = [
        ...vision.map((v) => ({ ...v, source: "vision" as const })),
        ...ai.map((a) => ({ ...a, source: "ai" as const })),
      ];

      if (newMerged.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          // Create a map of existing items by composite key
          const itemsMap = new Map(
            prev.map((item) => [`${item.source}-${item.id}`, item])
          );

          // Add new items, but only if they don't already exist
          newMerged.forEach((item) => {
            const key = `${item.source}-${item.id}`;
            if (!itemsMap.has(key)) {
              itemsMap.set(key, item);
            }
          });

          // Convert back to array and sort by date
          const combined = Array.from(itemsMap.values());
          combined.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          return combined;
        });

        setVisionOffset(prev => prev + vision.length);
        setAiOffset(prev => prev + ai.length);

        setHasMore(vision.length === PAGE_SIZE || ai.length === PAGE_SIZE);
      }
    } catch {
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [hasMore, loading, refreshing, visionOffset, aiOffset]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const getCompositeKey = (item: CombinedNotification) => `${item.source}-${item.id}`;

  const markRead = (item: CombinedNotification) => {
    setReadIds((prev) => new Set([...prev, getCompositeKey(item)]));
  };

  const markAllRead = () => {
    setReadIds(new Set(items.map(getCompositeKey)));
  };

  const unread = items.filter((n) => !readIds.has(getCompositeKey(n)));
  const read   = items.filter((n) => readIds.has(getCompositeKey(n)));
  const selectedItems = viewMode === "unread" ? unread : read;

  const onScrollBeginDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    hasUserScrolledRef.current = true;
    lastYRef.current = e.nativeEvent.contentOffset.y;
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    lastYRef.current = contentOffset.y;

    // Trigger load only after user interaction and only when content is actually scrollable
    if (!hasUserScrolledRef.current) return;
    if (contentOffset.y <= 0) return;
    if (contentSize.height <= layoutMeasurement.height) return;

    // Trigger load when within 300px of the bottom
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300) fetchMore();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ alignItems: "center", paddingTop: 3, paddingBottom: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Notifications</Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#111827" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ alignItems: "center", paddingTop: 3, paddingBottom: 18 }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Notifications</Text>
        </View>
        <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <MaterialIcons name="error-outline" size={40} color="#EF4444" />
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 12 }}>Something went wrong</Text>
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 4, textAlign: "center" }}>{error}</Text>
          <Pressable
            onPress={() => fetchNotifications()}
            style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#111827", borderRadius: 10 }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ alignItems: "center", paddingTop: 3, paddingBottom: 18 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}>Notifications</Text>
        {unread.length > 0 && (
          <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{unread.length} unread</Text>
        )}
      </View>

      <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />

      <View style={{ paddingHorizontal: 24, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 10, padding: 3 }}>
          <Pressable
            onPress={() => setViewMode("unread")}
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: "center",
              backgroundColor: viewMode === "unread" ? "white" : "transparent",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: viewMode === "unread" ? "#111827" : "#6B7280" }}>
              Unread
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("read")}
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: 8,
              alignItems: "center",
              backgroundColor: viewMode === "read" ? "white" : "transparent",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: viewMode === "read" ? "#111827" : "#6B7280" }}>
              Read
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchNotifications(true)} tintColor="#111827" />
        }
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>
              {viewMode === "unread" ? "New" : "Earlier"}
            </Text>
            {viewMode === "unread" && unread.length > 0 && (
              <Pressable onPress={markAllRead} hitSlop={10}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#6B7280" }}>Mark all read</Text>
              </Pressable>
            )}
          </View>

          <View style={{ gap: 12 }}>
            {selectedItems.map((n) => {
              const uniqueKey = `${n.source}-${n.id}`;

              if (n.source === "vision") {
                return (
                  <VisionNotificationCard
                    key={uniqueKey}
                    item={n}
                    isRead={viewMode === "read"}
                    onMarkRead={markRead}
                  />
                );
              }

              if (n.source === "ai") {
                return (
                  <AiNotificationCard
                    key={uniqueKey}
                    item={n}
                    isRead={viewMode === "read"}
                    onMarkRead={markRead}
                  />
                );
              }
              return null;
            })}
          </View>
        </View>

        {/* Load more footer */}
        {loadingMore && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        )}

        {!hasMore && items.length > 0 && (
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <Text style={{ fontSize: 13, color: "#9CA3AF" }}>No more notifications</Text>
          </View>
        )}

        {items.length === 0 && (
          <View style={{ paddingTop: 80, alignItems: "center", paddingHorizontal: 32 }}>
            <MaterialIcons name="notifications-none" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 16 }}>You are all caught up</Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 6, textAlign: "center" }}>No detection alerts right now.</Text>
          </View>
        )}

        {items.length > 0 && selectedItems.length === 0 && (
          <View style={{ paddingTop: 80, alignItems: "center", paddingHorizontal: 32 }}>
            <MaterialIcons name="notifications-none" size={40} color="#D1D5DB" />
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 14 }}>
              {viewMode === "unread" ? "You are all caught up" : "No read notifications yet"}
            </Text>
            {viewMode === "unread" && (
              <Text style={{ fontSize: 13, color: "#6B7280", marginTop: 6, textAlign: "center" }}>
                New notifications will show up here.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}