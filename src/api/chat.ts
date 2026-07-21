import { api } from "./client";

export type ChatMessage = {
  _id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
};

export type ChatThread = {
  jobId: string;
  jobTitle: string;
  peerUserId: string;
  peerName: string;
  lastMessage: {
    _id: string;
    body: string;
    fromUserId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
};

export async function fetchChatThreads() {
  const { data } = await api.get<{ threads: ChatThread[] }>("/api/chat/threads");
  return data.threads;
}

export async function fetchChatUnreadCount() {
  const { data } = await api.get<{ unread: number }>("/api/chat/unread-count");
  return data.unread;
}

export async function markChatThreadRead(jobId: string, peerUserId: string) {
  await api.patch("/api/chat/read", { jobId, peerUserId });
}

export async function fetchChatMessages(jobId: string, peerUserId: string) {
  const { data } = await api.get<{ messages: ChatMessage[] }>("/api/chat", {
    params: { jobId, peerUserId, limit: 100 },
  });
  return data.messages;
}

export async function sendChatMessage(jobId: string, toUserId: string, body: string) {
  const { data } = await api.post<{ message: ChatMessage }>("/api/chat", {
    jobId,
    toUserId,
    body,
  });
  return data.message;
}
