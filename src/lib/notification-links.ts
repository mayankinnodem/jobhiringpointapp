import type { UserRole } from "@/types";

type NotificationMeta = {
  jobId?: string;
  applicationId?: string;
  peerUserId?: string;
  fromUserId?: string;
  jobTitle?: string;
};

export function notificationRoute(
  type: string,
  meta: NotificationMeta | undefined,
  role: UserRole
): string | null {
  if (!meta) return null;

  const jobId = meta.jobId;
  const applicationId = meta.applicationId;
  const peerUserId = meta.peerUserId ?? meta.fromUserId;

  if (type === "application_received" && jobId && role === "recruiter") {
    return `/recruiter/applicants/${jobId}`;
  }
  if (type === "application_status" && jobId && role === "job_seeker") {
    return `/job/${jobId}`;
  }
  if (type === "application_status" && applicationId && role === "job_seeker") {
    return "/(tabs)/applications";
  }
  if (type === "chat_message" && jobId && peerUserId) {
    const qs = new URLSearchParams({ jobId, peerUserId });
    if (meta.jobTitle) qs.set("jobTitle", meta.jobTitle);
    return `/chat?${qs.toString()}`;
  }
  return null;
}
