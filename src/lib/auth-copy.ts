import type { UserRole } from "@/types";

export function roleDisplayName(role: UserRole): string {
  if (role === "recruiter") return "Recruiter";
  if (role === "admin") return "Admin";
  return "Job Seeker";
}

export function authSubtitle(
  kind: "login" | "register",
  role: UserRole
): string {
  if (kind === "login") {
    return role === "recruiter"
      ? "Sign in with email or mobile. After login you’ll manage jobs & applicants."
      : "Sign in with email or mobile. After login you can search & apply to jobs.";
  }
  return role === "recruiter"
    ? "Create a recruiter account — next you’ll set up your company profile."
    : "Create a job seeker account — next you’ll add skills, resume & preferences.";
}

export function afterAuthHint(role: UserRole, kind: "login" | "register"): string {
  if (kind === "register") {
    return role === "recruiter"
      ? "Next step: company name, website & hiring profile"
      : "Next step: headline, skills, location & resume";
  }
  return role === "recruiter"
    ? "You’ll land on your hiring dashboard"
    : "You’ll land on job search & recommendations";
}

export const SEEKER_REGISTER_STEPS = ["Account", "Mobile", "Verify"] as const;
export const RECRUITER_REGISTER_STEPS = ["Account", "Mobile", "Company", "Verify"] as const;

export function registerStepLabels(role: UserRole, websiteRequired: boolean): string[] {
  if (role === "recruiter" && websiteRequired) {
    return [...RECRUITER_REGISTER_STEPS];
  }
  return [...SEEKER_REGISTER_STEPS];
}
