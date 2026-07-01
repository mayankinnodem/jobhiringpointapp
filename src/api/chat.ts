import { api } from "./client";

export type ChatMessage = {
  _id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
};

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
