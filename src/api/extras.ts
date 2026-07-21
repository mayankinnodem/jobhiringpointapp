import { api } from "./client";
import type { JobListItem } from "@/types";

type ApiNotification = {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  meta?: {
    jobId?: string;
    applicationId?: string;
    peerUserId?: string;
    fromUserId?: string;
    jobTitle?: string;
    status?: string;
  };
};

export type NotificationItem = {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type?: string;
  meta?: ApiNotification["meta"];
};

function mapNotification(n: ApiNotification): NotificationItem {
  const titles: Record<string, string> = {
    application_received: "New application",
    application_status: "Application update",
    payment: "Payment",
    system: "System",
  };
  return {
    _id: n._id,
    title: titles[n.type] ?? "Notification",
    body: n.message,
    read: n.isRead,
    createdAt: n.createdAt,
    type: n.type,
    meta: n.meta,
  };
}

export async function fetchUnreadCount() {
  const { data } = await api.get<{ unread: number }>("/api/notifications/unread-count");
  return data.unread;
}

export async function fetchNotifications() {
  const { data } = await api.get<{ notifications: ApiNotification[] }>(
    "/api/notifications",
    { params: { limit: 50 } }
  );
  return data.notifications.map(mapNotification);
}

export async function markNotificationsRead(ids?: string[]) {
  if (ids?.length) {
    await api.post("/api/notifications/read", { ids });
  } else {
    await api.post("/api/notifications/read", { markAll: true });
  }
}

export async function fetchSavedJobs() {
  const { data } = await api.get<{ jobs: JobListItem[] }>("/api/seeker/saved-jobs");
  return data.jobs;
}

export async function saveJob(jobId: string) {
  await api.post("/api/seeker/saved-jobs", { jobId });
}

export async function unsaveJob(jobId: string) {
  await api.delete(`/api/seeker/saved-jobs/${jobId}`);
}

export async function fetchSavedJobIds() {
  const { data } = await api.get<{ jobIds: string[] }>("/api/seeker/saved-jobs/ids");
  return new Set(data.jobIds);
}
