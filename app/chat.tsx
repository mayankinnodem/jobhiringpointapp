import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fetchChatMessages, sendChatMessage, type ChatMessage } from "@/api/chat";
import { getApiErrorMessage } from "@/api/client";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, spacing } from "@/theme";

export default function ChatScreen() {
  const { jobId, peerUserId, peerName } = useLocalSearchParams<{
    jobId: string;
    peerUserId: string;
    peerName?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!jobId || !peerUserId) return;
    try {
      const msgs = await fetchChatMessages(jobId, peerUserId);
      setMessages(msgs);
    } catch {
      /* chat may not be available yet */
    } finally {
      setLoading(false);
    }
  }, [jobId, peerUserId]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 8000);
    return () => clearInterval(interval);
  }, [load]);

  async function onSend() {
    if (!text.trim() || !jobId || !peerUserId) return;
    setSending(true);
    try {
      const msg = await sendChatMessage(jobId, peerUserId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      alert(getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  const title = peerName ? decodeURIComponent(peerName) : "Chat";

  return (
    <>
      <Stack.Screen options={{ title, headerTintColor: colors.brand }} />
      <Screen edges={["left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={90}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brandLight} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.slate400} />
                  <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
                </View>
              }
              renderItem={({ item }) => {
                const mine = String(item.fromUserId) === user?.id;
                return (
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                    <Text style={[styles.time, mine && styles.timeMine]}>
                      {new Date(item.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                );
              }}
            />
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message…"
              placeholderTextColor={colors.slate400}
              multiline
            />
            <Pressable style={styles.sendBtn} onPress={() => void onSend()} disabled={sending || !text.trim()}>
              <Ionicons name="send" size={20} color={colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, paddingBottom: 8, flexGrow: 1 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 14, color: colors.slate400 },
  bubble: {
    maxWidth: "80%",
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.brand, borderColor: colors.brand },
  bubbleTheirs: {},
  bubbleText: { fontSize: 15, color: colors.slate900, lineHeight: 20 },
  bubbleTextMine: { color: colors.white },
  time: { fontSize: 10, color: colors.slate400, marginTop: 4, alignSelf: "flex-end" },
  timeMine: { color: "rgba(255,255,255,0.7)" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.brand100,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.slate900,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
