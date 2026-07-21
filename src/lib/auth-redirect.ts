import type { UserRole } from "@/types";

export function dashboardForRole(role: UserRole): string {
  return "/(tabs)";
}

export function onboardingForRole(role: UserRole): string {
  if (role === "job_seeker") return "/complete-profile";
  return "/recruiter/company";
}

export function resolvePostAuthPath(
  role: UserRole,
  kind: "login" | "register"
): string {
  return kind === "register" ? onboardingForRole(role) : dashboardForRole(role);
}
