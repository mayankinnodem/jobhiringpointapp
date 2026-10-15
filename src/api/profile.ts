import { api, apiBaseUrl } from "./client";

export type EducationEntry = {
  degree: string;
  institution: string;
  year?: number;
};

export type JobPreferences = {
  preferredJobTypes?: string[];
  preferredWorkModes?: string[];
  preferredLocations?: string[];
  preferredIndustries?: string[];
  preferredRoles?: string[];
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  openToRelocate?: boolean;
  noticePeriod?: string;
  employmentStatus?: string;
  shiftPreferences?: string[];
};

export type SeekerProfile = {
  phone?: string;
  location?: string;
  addressLine?: string;
  headline?: string;
  skills?: string[];
  experienceYears?: number;
  experienceSummary?: string;
  education?: EducationEntry[];
  resumeUrl?: string;
  resumeFilename?: string;
  jobPreferences?: JobPreferences;
};

export type ProfileMeta = {
  profile: SeekerProfile;
  completeness: { percent: number; missing: string[] };
  canApply: { allowed: boolean; percent: number; missing: string[] };
  preferencesCompleteness?: { percent: number; missing: string[] };
};

export async function fetchSeekerProfile() {
  const { data } = await api.get<ProfileMeta>("/api/seeker/profile");
  return data;
}

export async function updateSeekerProfile(payload: {
  phone?: string;
  location?: string;
  addressLine?: string;
  headline?: string;
  skills?: string | string[];
  experienceYears?: number;
  experienceSummary?: string;
  education?: EducationEntry[];
  jobPreferences?: JobPreferences;
}) {
  const { data } = await api.put<ProfileMeta>("/api/seeker/profile", payload);
  return data;
}

export async function uploadResume(uri: string, filename: string, mimeType: string) {
  const form = new FormData();
  form.append("file", {
    uri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);
  const { data } = await api.post<{ profile: SeekerProfile }>("/api/seeker/resume", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.profile;
}

export function webProfileUrl() {
  return `${apiBaseUrl.replace(/\/$/, "")}/seeker/profile`;
}
