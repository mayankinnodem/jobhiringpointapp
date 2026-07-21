import { io, type Socket } from "socket.io-client";
import { apiBaseUrl, getToken } from "@/api/client";

export async function createChatSocket(): Promise<Socket> {
  const token = await getToken();
  if (!token) {
    throw new Error("Not signed in");
  }

  return io(apiBaseUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: { token },
  });
}

export function joinChatThread(
  socket: Socket,
  jobId: string,
  peerUserId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.emit(
      "chat:join",
      { jobId, peerUserId },
      (ack: { error?: string; ok?: boolean }) => {
        if (ack?.error) reject(new Error(ack.error));
        else resolve();
      }
    );
  });
}

export function sendChatViaSocket(
  socket: Socket,
  jobId: string,
  peerUserId: string,
  body: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.emit(
      "chat:message",
      { jobId, peerUserId, body },
      (ack: { error?: string }) => {
        if (ack?.error) reject(new Error(ack.error));
        else resolve();
      }
    );
  });
}
