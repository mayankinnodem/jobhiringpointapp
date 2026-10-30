import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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
import { fetchChatThreads, type ChatThread } from "@/api/chat";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { TabGradientHeader } from "@/components/TabGradientHeader";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, spacing } from "@/theme";
import { isPeerBlocked, loadBlockedPeers } from "@/lib/safety";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function MessagesScreen() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      await loadBlockedPeers();
      setThreads((await fetchChatThreads()).filter((thread) => !isPeerBlocked(thread.peerUserId)));
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

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function openThread(t: ChatThread) {
    setThreads((prev) =>
      prev.map((row) =>
        row.jobId === t.jobId && row.peerUserId === t.peerUserId
          ? { ...row, unreadCount: 0 }
          : row
      )
    );
    router.push(
      `/chat?jobId=${t.jobId}&peerUserId=${t.peerUserId}&peerName=${encodeURIComponent(t.peerName)}&jobTitle=${encodeURIComponent(t.jobTitle)}`
    );
  }

  if (loading && !refreshing) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  if (error) {
    return (
      <EmptyState title="Could not load" subtitle={error} actionLabel="Retry" onAction={() => { setLoading(true); void load(); }} />
    );
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <TabGradientHeader title="Messages" subtitle="Chat with recruiters or candidates" />

      <FlatList
        data={threads}
        keyExtractor={(item) => `${item.jobId}-${item.peerUserId}`}
        contentContainerStyle={threads.length ? styles.list : styles.listEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        ListEmptyComponent={
          <EmptyState
            title="No conversations yet"
            subtitle="Apply to jobs or review applicants to start messaging."
          />
        }
        renderItem={({ item }) => {
          const unread = item.unreadCount > 0;
          return (
          <Pressable
            style={[styles.row, unread && styles.rowUnread]}
            onPress={() => openThread(item)}
          >
            <View style={[styles.avatar, unread && styles.avatarUnread]}>
              <Ionicons name="chatbubble-ellipses" size={22} color={colors.brandLight} />
            </View>
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={[styles.peerName, unread && styles.peerNameUnread]} numberOfLines={1}>
                  {item.peerName}
                </Text>
                <Text style={styles.time}>{formatTime(item.updatedAt)}</Text>
              </View>
              <Text style={styles.jobTitle} numberOfLines={1}>{item.jobTitle}</Text>
              <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
                {item.lastMessage?.body ?? "Start a conversation"}
              </Text>
            </View>
            {unread ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount > 9 ? "9+" : item.unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  listEmpty: { flexGrow: 1, paddingBottom: spacing.xl },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  rowUnread: { borderColor: colors.brandLight, backgroundColor: colors.brand50 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff4e6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarUnread: { backgroundColor: "rgba(255,140,0,0.15)" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  peerName: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.slate900 },
  peerNameUnread: { color: colors.brand },
  time: { fontSize: 11, color: colors.slate400 },
  jobTitle: { marginTop: 2, fontSize: 12, fontWeight: "600", color: colors.brandLight },
  preview: { marginTop: 4, fontSize: 14, color: colors.slate400 },
  previewUnread: { color: colors.slate600, fontWeight: "600" },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginTop: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: colors.white },
});
