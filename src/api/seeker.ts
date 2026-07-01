import { api } from "./client";
import type { CompanyItem, JobAlertItem, JobListItem } from "@/types";

export async function fetchRecommendedJobs() {
  const { data } = await api.get<{ jobs: JobListItem[] }>("/api/seeker/recommended");
  return data.jobs;
}

export async function fetchJobAlerts() {
  const { data } = await api.get<{ alerts: JobAlertItem[] }>("/api/seeker/job-alerts");
  return data.alerts;
}

export async function createJobAlert(payload: {
  name: string;
  keywords?: string;
  location?: string;
  categorySlug?: string;
  salaryMin?: number;
}) {
  const { data } = await api.post<{ alert: JobAlertItem }>("/api/seeker/job-alerts", payload);
  return data.alert;
}

export async function updateJobAlert(
  id: string,
  payload: Partial<{ name: string; keywords: string; location: string; isActive: boolean }>
) {
  const { data } = await api.patch<{ alert: JobAlertItem }>(
    `/api/seeker/job-alerts/${id}`,
    payload
  );
  return data.alert;
}

export async function deleteJobAlert(id: string) {
  await api.delete(`/api/seeker/job-alerts/${id}`);
}

export async function fetchCompanies(q?: string) {
  const { data } = await api.get<{ companies: CompanyItem[] }>("/api/companies", {
    params: { q, limit: 50 },
  });
  return data.companies;
}

export async function fetchCompany(id: string) {
  const { data } = await api.get<{ company: CompanyItem & { jobs?: JobListItem[] } }>(
    `/api/companies/${id}`
  );
  return data.company;
}

export async function fetchCategories() {
  const { data } = await api.get<{
    categories: { _id: string; name: string; slug: string; jobCount?: number }[];
  }>("/api/categories");
  return data.categories;
}
