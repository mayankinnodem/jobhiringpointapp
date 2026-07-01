export type UserRole = "job_seeker" | "recruiter" | "admin";

export type SubscriptionPlan = "free" | "pro" | "premium";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "interview_scheduled"
  | "hired"
  | "withdrawn";

export type PublicUser = {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt: string | null;
};

export type CompanyRef = {
  _id: string;
  name: string;
  industry?: string;
};

export type RecruiterRef = {
  _id: string;
  name: string;
  email?: string;
};

export type CompanyItem = {
  _id: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  logoUrl?: string;
  jobCount?: number;
};

export type JobAlertItem = {
  _id: string;
  name: string;
  keywords?: string;
  location?: string;
  categorySlug?: string;
  salaryMin?: number | null;
  isActive: boolean;
  createdAt?: string;
};

export type JobListItem = {
  _id: string;
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceMinYears?: number;
  requiredSkills?: string[];
  status: string;
  createdAt: string;
  companyId?: CompanyRef | string;
  recruiterId?: RecruiterRef | string;
  jobType?: string;
  isFeatured?: boolean;
  descriptionHtml?: string;
  categoryId?: string;
};

export type ApplicationItem = {
  _id: string;
  status: ApplicationStatus;
  createdAt: string;
  jobId?: JobListItem & { companyId?: CompanyRef };
};
