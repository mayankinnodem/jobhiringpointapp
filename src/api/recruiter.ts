import { api } from "./client";
import type { ApplicationStatus, CompanyItem, JobListItem } from "@/types";

export type RecruiterApplicant = {
  _id: string;
  status: ApplicationStatus;
  createdAt: string;
  coverLetter?: string;
  seekerId?: { _id: string; name: string; email: string };
  profile?: {
    headline?: string;
    skills?: string[];
    experienceYears?: number;
    location?: string;
    resumeFilename?: string;
  } | null;
};

export async function fetchRecruiterCompany() {
  const { data } = await api.get<{ company: CompanyItem | null }>("/api/recruiter/company");
  return data.company;
}

export async function saveRecruiterCompany(payload: {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
}) {
  const { data } = await api.post<{ company: CompanyItem }>("/api/recruiter/company", payload);
  return data.company;
}

export async function fetchRecruiterJob(id: string) {
  const { data } = await api.get<{ job: JobListItem & { descriptionHtml?: string } }>(
    `/api/recruiter/jobs/${id}`
  );
  return data.job;
}

export async function createRecruiterJob(payload: {
  title: string;
  descriptionHtml: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  requiredSkills?: string[];
  experienceMinYears?: number;
  status?: "draft" | "pending_review";
  categoryId?: string | null;
  jobType?: string;
}) {
  const { data } = await api.post<{ job: JobListItem }>("/api/recruiter/jobs", payload);
  return data.job;
}

export async function updateRecruiterJob(
  id: string,
  payload: Partial<{
    title: string;
    descriptionHtml: string;
    salaryMin: number;
    salaryMax: number;
    location: string;
    requiredSkills: string[];
    experienceMinYears: number;
    status: string;
    categoryId: string | null;
    jobType: string;
  }>
) {
  const { data } = await api.put<{ job: JobListItem }>(`/api/recruiter/jobs/${id}`, payload);
  return data.job;
}

export async function deleteRecruiterJob(id: string) {
  await api.delete(`/api/recruiter/jobs/${id}`);
}

export async function fetchJobApplicants(jobId: string) {
  const { data } = await api.get<{ applications: RecruiterApplicant[] }>(
    `/api/recruiter/jobs/${jobId}/applicants`
  );
  return data.applications;
}

export async function updateApplicationStatus(
  applicationId: string,
  payload: {
    status?: ApplicationStatus;
    interviewNotes?: string;
    recruiterNotes?: string;
  }
) {
  const { data } = await api.patch<{ application: RecruiterApplicant }>(
    `/api/recruiter/applications/${applicationId}`,
    payload
  );
  return data.application;
}
