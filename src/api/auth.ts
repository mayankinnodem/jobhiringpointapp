import { api, setToken } from "./client";
import type { PublicUser, UserRole } from "@/types";

type AuthResponse = { user: PublicUser; token: string };

export async function sendOtp(payload: {
  phone: string;
  purpose: "register" | "login";
  name?: string;
  role?: "job_seeker" | "recruiter";
}) {
  const { data } = await api.post<{ ok: boolean; expiresInSeconds: number }>(
    "/api/auth/otp/send",
    payload
  );
  return data;
}

export async function verifyOtp(payload: {
  phone: string;
  otp: string;
  purpose: "register" | "login";
  expectedRole?: UserRole;
}) {
  const { data } = await api.post<AuthResponse>("/api/auth/otp/verify", payload);
  await setToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: PublicUser | null }>("/api/auth/me");
  return data.user;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    await setToken(null);
  }
}
