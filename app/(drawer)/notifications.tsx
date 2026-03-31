import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getImageUri,
  getVisionNotifications,
  VisionNotification,
} from "@/lib/api/visionNotifications";

/* ---------------- Constants ---------------- */

const PAGE_SIZE = 20;

/* ---------------- Helpers ---------------- */

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

/* ---------------- Vision Notification Card ---------------- */

function VisionNotificationCard({
  item,
  isRead,
  isDraggingRef,
  onMarkRead,
}: {
  item: VisionNotification;
  isRead: boolean;
  isDraggingRef: React.MutableRefObject<boolean>;
  onMarkRead: (id: number) => void;
}) {
  const onPress = () => {
    if (isDraggingRef.current) return;
    onMarkRead(item.id);
    router.push({
      pathname: "/(drawer)/visionNotificationDetail",
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

/* ---------------- Screen ---------------- */

export default function Notifications() {
  const [items, setItems] = useState<VisionNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"unread" | "read">("unread");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const lastYRef = useRef(0);
  const loadingMoreRef = useRef(false); // ref copy prevents stale closure issues

  /** Initial load or pull-to-refresh — always resets to page 0 */
  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await getVisionNotifications(0, PAGE_SIZE);
      setItems(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /** Load the next page when the user scrolls near the bottom */
  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await getVisionNotifications(items.length, PAGE_SIZE);
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          return [...prev, ...data.filter((n) => !existingIds.has(n.id))];
        });
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch {
      // Silent — user can scroll again to retry
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [hasMore, items.length]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = (id: number) => setReadIds((prev) => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(items.map((n) => n.id)));

  const unread = items.filter((n) => !readIds.has(n.id));
  const read   = items.filter((n) => readIds.has(n.id));
  const selectedItems = viewMode === "unread" ? unread : read;

  const onScrollBeginDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDraggingRef.current = true;
    lastYRef.current = e.nativeEvent.contentOffset.y;
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (Math.abs(contentOffset.y - lastYRef.current) > 2) isDraggingRef.current = true;
    lastYRef.current = contentOffset.y;

    // Trigger load-more when within 300px of the bottom
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    if (distanceFromBottom < 300) fetchMore();
  };

  const onScrollEndDrag = () => {
    setTimeout(() => { isDraggingRef.current = false; }, 140);
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
        onScrollEndDrag={onScrollEndDrag}
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
          <View style={{ gap: 10 }}>
            {selectedItems.map((n) => (
              <VisionNotificationCard
                key={n.id}
                item={n}
                isRead={viewMode === "read"}
                isDraggingRef={isDraggingRef}
                onMarkRead={markRead}
              />
            ))}
          </View>
        </View>

        {/* Load-more footer */}
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
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 16 }}>You're all caught up</Text>
            <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 6, textAlign: "center" }}>No detection alerts right now.</Text>
          </View>
        )}

        {items.length > 0 && selectedItems.length === 0 && (
          <View style={{ paddingTop: 80, alignItems: "center", paddingHorizontal: 32 }}>
            <MaterialIcons name="notifications-none" size={40} color="#D1D5DB" />
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 14 }}>
              {viewMode === "unread" ? "You're all caught up" : "No read notifications yet"}
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
