import { api, setToken } from "./client";
import { normalizeOtpInput } from "@/constants/otp";
import type { PublicUser, UserRole } from "@/types";

type AuthResponse = { user: PublicUser; token: string; roleCorrected?: boolean };

export type SendOtpResponse = {
  ok: boolean;
  identifier: string;
  channel: "sms" | "email";
  masked: string;
  expiresInSeconds: number;
};

export type RegistrationSettings = {
  phoneRequiredOnRegister: boolean;
  websiteRequiredOnRecruiterRegister: boolean;
};

export async function fetchRegistrationSettings() {
  const { data } = await api.get<RegistrationSettings>("/api/auth/registration-settings");
  return data;
}

export async function checkAuthAvailability(payload: { email?: string; phone?: string }) {
  const { data } = await api.post<{ ok: boolean; available: boolean }>(
    "/api/auth/check-availability",
    payload
  );
  return data;
}

export async function sendRegisterOtp(payload: {
  email: string;
  phone?: string;
  name: string;
  role: "job_seeker" | "recruiter";
  companyWebsite?: string;
  acceptedTerms: true;
}) {
  const { data } = await api.post<SendOtpResponse>("/api/auth/otp/send", {
    purpose: "register",
    ...payload,
  });
  return data;
}

export async function sendLoginOtp(identifier: string) {
  const { data } = await api.post<SendOtpResponse>("/api/auth/otp/send", {
    purpose: "login",
    identifier: identifier.trim(),
  });
  return data;
}

export async function verifyOtp(payload: {
  identifier: string;
  otp: string;
  purpose: "register" | "login";
  expectedRole?: UserRole;
}) {
  const identifier = payload.identifier.trim();
  const { data } = await api.post<AuthResponse>("/api/auth/otp/verify", {
    identifier,
    otp: normalizeOtpInput(payload.otp),
    purpose: payload.purpose,
    expectedRole: payload.expectedRole,
  });
  await setToken(data.token);
  return { user: data.user, roleCorrected: !!data.roleCorrected };
}

export async function loginWithEmail(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
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

export type RoleSwitchEligibility = {
  currentRole: "job_seeker" | "recruiter";
  targetRole: "job_seeker" | "recruiter";
  canSwitch: boolean;
  blockers: string[];
};

export async function fetchRoleSwitchEligibility() {
  const { data } = await api.get<RoleSwitchEligibility>("/api/auth/switch-role");
  return data;
}

export async function switchAccountRole(newRole: "job_seeker" | "recruiter") {
  const { data } = await api.post<AuthResponse>("/api/auth/switch-role", { newRole });
  await setToken(data.token);
  return data.user;
}
