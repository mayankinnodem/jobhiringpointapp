import { api } from "./client";
import type { ApplicationItem, JobListItem } from "@/types";

export async function fetchJobs(params?: {
  q?: string;
  page?: number;
  limit?: number;
  jobType?: string;
  location?: string;
  category?: string;
  mine?: string;
}) {
  const { data } = await api.get<{
    jobs: JobListItem[];
    meta?: { pagination?: { totalPages: number; total: number; page: number } };
  }>("/api/jobs", { params: { page: 1, limit: 20, ...params } });
  return data;
}

export async function fetchJob(id: string) {
  const { data } = await api.get<{ job: JobListItem }>(`/api/jobs/${id}`);
  return data.job;
}

export async function fetchSimilarJobs(jobId: string) {
  const { data } = await api.get<{ jobs: JobListItem[] }>(`/api/jobs/${jobId}/similar`);
  return data.jobs;
}

export async function fetchJobMatch(jobId: string) {
  const { data } = await api.get<{
    percent: number;
    matched: string[];
    missing: string[];
  }>(`/api/jobs/${jobId}/match`);
  return data;
}

export async function fetchSeekerState(jobId: string) {
  const { data } = await api.get<{
    applied: boolean;
    status?: string;
    applicationId?: string | null;
    saved?: boolean;
  }>(`/api/jobs/${jobId}/seeker-state`);
  return data;
}

export async function applyToJob(jobId: string, coverLetter?: string) {
  const { data } = await api.post(`/api/jobs/${jobId}/apply`, {
    coverLetter: coverLetter ?? "",
  });
  return data;
}

export async function withdrawApplication(applicationId: string) {
  const { data } = await api.delete(`/api/seeker/applications/${applicationId}`);
  return data;
}

export async function fetchApplications() {
  const { data } = await api.get<{ applications: ApplicationItem[] }>(
    "/api/seeker/applications"
  );
  return data.applications;
}

export async function fetchRecruiterDashboard() {
  const { data } = await api.get<{
    jobCount: number;
    publishedJobs: number;
    applicationsCount: number;
    pendingJobs: number;
    totalViews?: number;
  }>("/api/recruiter/dashboard");
  return {
    totalJobs: data.jobCount,
    publishedJobs: data.publishedJobs,
    totalApplications: data.applicationsCount,
    pendingJobs: data.pendingJobs,
    totalViews: data.totalViews ?? 0,
  };
}

export async function fetchRecruiterJobs() {
  const { data } = await api.get<{ jobs: JobListItem[] }>("/api/recruiter/jobs");
  return data.jobs;
}
