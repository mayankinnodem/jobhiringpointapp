import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { useLocalSearchParams } from "expo-router";
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
import type { Socket } from "socket.io-client";
import {
  fetchChatMessages,
  markChatThreadRead,
  sendChatMessage,
  type ChatMessage,
} from "@/api/chat";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import {
  createChatSocket,
  joinChatThread,
  sendChatViaSocket,
} from "@/lib/chat-socket";
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
  const [error, setError] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const listRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((x) => x._id === msg._id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const load = useCallback(async () => {
    if (!jobId || !peerUserId) return;
    try {
      setError(null);
      const msgs = await fetchChatMessages(jobId, peerUserId);
      setMessages(msgs);
      await markChatThreadRead(jobId, peerUserId).catch(() => {});
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [jobId, peerUserId]);

  useEffect(() => {
    if (!jobId || !peerUserId) {
      setLoading(false);
      setError("Invalid chat link");
      return;
    }
    void load();
  }, [jobId, peerUserId, load]);

  useEffect(() => {
    if (!jobId || !peerUserId || !user) return;
    let cancelled = false;
    let socket: Socket | null = null;

    void (async () => {
      try {
        socket = await createChatSocket();
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;

        socket.on("connect", () => {
          void joinChatThread(socket!, jobId, peerUserId)
            .then(() => {
              if (!cancelled) setSocketReady(true);
            })
            .catch((e) => {
              if (!cancelled) setError(getApiErrorMessage(e));
            });
        });

        socket.on("chat:message", (payload: { message?: ChatMessage }) => {
          const msg = payload?.message;
          if (!msg) return;
          appendMessage(msg);
          if (String(msg.fromUserId) === peerUserId) {
            void markChatThreadRead(jobId, peerUserId).catch(() => {});
          }
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
        });

        socket.on("chat:typing", (payload: { fromUserId?: string; typing?: boolean }) => {
          if (payload?.fromUserId === peerUserId) {
            setTyping(!!payload.typing);
          }
        });

        socket.on("disconnect", () => setSocketReady(false));
      } catch {
        /* REST fallback only */
      }
    })();

    const poll = setInterval(() => {
      if (!socketRef.current?.connected) void load();
    }, 12000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      socket?.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [jobId, peerUserId, user, appendMessage, load]);

  async function onSend() {
    if (!text.trim() || !jobId || !peerUserId) return;
    const body = text.trim();
    setSending(true);
    try {
      if (socketRef.current?.connected && socketReady) {
        await sendChatViaSocket(socketRef.current, jobId, peerUserId, body);
        setText("");
      } else {
        const msg = await sendChatMessage(jobId, peerUserId, body);
        appendMessage(msg);
        setText("");
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (e) {
      appAlert("Could not send", getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  const title = peerName ? decodeURIComponent(peerName) : "Chat";

  return (
    <StackPageShell title={title}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brandLight} />
            </View>
          ) : error ? (
            <EmptyState
              title="Chat unavailable"
              subtitle={error}
              actionLabel="Retry"
              onAction={() => {
                setLoading(true);
                void load();
              }}
            />
          ) : (
            <>
              {typing ? (
                <Text style={styles.typing}>Typing…</Text>
              ) : null}
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
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  );
                }}
              />
            </>
          )}
          {!error ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Type a message…"
                placeholderTextColor={colors.slate400}
                multiline
              />
              <Pressable
                style={styles.sendBtn}
                onPress={() => void onSend()}
                disabled={sending || !text.trim()}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </Pressable>
            </View>
          ) : null}
        </KeyboardAvoidingView>
    </StackPageShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  typing: { fontSize: 12, fontStyle: "italic", color: colors.slate400, paddingHorizontal: spacing.md, paddingTop: 8 },
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
