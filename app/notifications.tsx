import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  fetchNotifications,
  markNotificationsRead,
  type NotificationItem,
} from "@/api/extras";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import { notificationRoute } from "@/lib/notification-links";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, shadow, spacing } from "@/theme";

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await fetchNotifications());
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onOpen(item: NotificationItem) {
    if (!item.read) {
      try {
        await markNotificationsRead([item._id]);
        setItems((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      } catch {
        /* continue navigation */
      }
    }

    const route =
      user?.role && item.type
        ? notificationRoute(item.type, item.meta, user.role)
        : null;

    if (route) {
      router.push(route as "/chat");
      return;
    }
    if (item.meta?.jobId) {
      router.push(`/job/${item.meta.jobId}`);
    }
  }

  return (
    <StackPageShell title="Notifications">
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandLight} />
          </View>
        ) : error ? (
          <EmptyState
            title="Could not load"
            subtitle={error}
            actionLabel="Retry"
            onAction={() => {
              setLoading(true);
              void load();
            }}
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            contentContainerStyle={items.length ? styles.list : styles.listEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  void load();
                }}
              />
            }
            ListHeaderComponent={
              items.length ? (
                <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.banner}>
                  <Ionicons name="notifications" size={28} color={colors.brandLight} />
                  <Text style={styles.bannerTitle}>Stay in the loop</Text>
                  <Text style={styles.bannerSub}>
                    Application updates, interview invites & job alerts
                  </Text>
                </LinearGradient>
              ) : null
            }
            ListEmptyComponent={
              <EmptyState
                icon="notifications-off-outline"
                title="All caught up"
                subtitle="No notifications yet. Apply to jobs and we'll notify you about updates."
                actionLabel="Browse jobs"
                onAction={() => router.back()}
              />
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, !item.read && styles.cardUnread]}
                onPress={() => void onOpen(item)}
              >
                <View style={[styles.iconWrap, !item.read && styles.iconUnread]}>
                  <Ionicons
                    name={iconForType(item.type)}
                    size={20}
                    color={item.read ? colors.slate400 : colors.brandLight}
                  />
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardBody2}>{item.body}</Text>
                  <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
    </StackPageShell>
  );
}

function iconForType(type?: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "application_received":
      return "person-add-outline";
    case "application_status":
      return "document-text-outline";
    case "chat_message":
      return "chatbubbles-outline";
    case "payment":
      return "card-outline";
    case "system":
      return "information-circle-outline";
    default:
      return "notifications-outline";
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
  banner: {
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: 6,
  },
  bannerTitle: { fontSize: 18, fontWeight: "800", color: colors.white },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  card: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: spacing.md,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
  },
  cardUnread: { borderColor: colors.brandLight, backgroundColor: colors.brand50 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconUnread: { backgroundColor: "rgba(255,140,0,0.15)" },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.brand },
  cardBody2: { fontSize: 13, color: colors.slate500, marginTop: 4, lineHeight: 18 },
  cardTime: { fontSize: 11, color: colors.slate400, marginTop: 6 },
});
