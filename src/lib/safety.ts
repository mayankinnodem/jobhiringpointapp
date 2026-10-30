import * as SecureStore from "expo-secure-store";
import { api } from "@/api/client";

const BLOCKED_KEY = "blocked_peer_ids";
const blocked = new Set<string>();
let loaded = false;

export async function loadBlockedPeers() {
  if (loaded) return blocked;
  const raw = await SecureStore.getItemAsync(BLOCKED_KEY);
  blocked.clear();
  if (raw) {
    try {
      const ids = JSON.parse(raw) as string[];
      for (const id of ids) blocked.add(id);
    } catch {
      // Ignore a corrupt local block list and start fresh.
    }
  }
  loaded = true;
  return blocked;
}

export function isPeerBlocked(id: string) {
  return blocked.has(id);
}

export async function blockPeer(id: string) {
  await loadBlockedPeers();
  blocked.add(id);
  await SecureStore.setItemAsync(BLOCKED_KEY, JSON.stringify([...blocked]));
}

export async function reportContent(input: {
  name: string;
  email: string;
  category: "harassment" | "fraud" | "general" | "privacy";
  description: string;
}) {
  const { data } = await api.post<{ message: string }>("/api/grievance", input);
  return data;
}
