export const JOB_TYPE_CHIPS = [
  { label: "Full time", value: "full_time" },
  { label: "Part time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
  { label: "Remote", value: "remote" },
] as const;

export const WORK_MODE_CHIPS = [
  { label: "Office", value: "onsite" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Work from home", value: "remote" },
] as const;

export const PREFERRED_CITY_OPTIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Remote / WFH",
  "Any city in India",
] as const;

export const INDUSTRY_OPTIONS = [
  "IT / Software",
  "Banking & Finance",
  "Healthcare",
  "Education",
  "Retail / E-commerce",
  "Manufacturing",
  "BPO / KPO",
  "Startup",
  "Any industry",
] as const;

export const TARGET_ROLE_OPTIONS = [
  "Software Developer",
  "Data Analyst",
  "Digital Marketer",
  "Sales Executive",
  "HR Executive",
  "Customer Support",
  "Accountant",
  "Content Writer",
] as const;

export const NOTICE_PERIOD_CHIPS = [
  { label: "Immediate", value: "immediate" },
  { label: "15 days", value: "15_days" },
  { label: "30 days", value: "30_days" },
  { label: "60 days", value: "60_days" },
  { label: "90 days", value: "90_days" },
] as const;

export const EMPLOYMENT_STATUS_CHIPS = [
  { label: "Employed", value: "employed" },
  { label: "Job seeking", value: "unemployed" },
  { label: "Student", value: "student" },
  { label: "Freelancer", value: "freelancer" },
] as const;

export const SALARY_CHIPS = [
  { label: "₹3–5 LPA", min: 300000, max: 500000 },
  { label: "₹5–8 LPA", min: 500000, max: 800000 },
  { label: "₹8–12 LPA", min: 800000, max: 1200000 },
  { label: "₹12–18 LPA", min: 1200000, max: 1800000 },
  { label: "₹18–25 LPA", min: 1800000, max: 2500000 },
  { label: "₹25+ LPA", min: 2500000, max: null as number | null },
] as const;

export type JobPreferencesState = {
  preferredJobTypes: string[];
  preferredWorkModes: string[];
  preferredLocations: string[];
  preferredIndustries: string[];
  preferredRoles: string[];
  expectedSalaryMin: number | null;
  expectedSalaryMax: number | null;
  openToRelocate: boolean;
  noticePeriod: string;
  employmentStatus: string;
};

export const EMPTY_JOB_PREFERENCES: JobPreferencesState = {
  preferredJobTypes: [],
  preferredWorkModes: [],
  preferredLocations: [],
  preferredIndustries: [],
  preferredRoles: [],
  expectedSalaryMin: null,
  expectedSalaryMax: null,
  openToRelocate: false,
  noticePeriod: "",
  employmentStatus: "",
};

export function normalizeJobPreferences(raw?: Partial<JobPreferencesState> | null): JobPreferencesState {
  return {
    preferredJobTypes: raw?.preferredJobTypes ?? [],
    preferredWorkModes: raw?.preferredWorkModes ?? [],
    preferredLocations: raw?.preferredLocations ?? [],
    preferredIndustries: raw?.preferredIndustries ?? [],
    preferredRoles: raw?.preferredRoles ?? [],
    expectedSalaryMin: raw?.expectedSalaryMin ?? null,
    expectedSalaryMax: raw?.expectedSalaryMax ?? null,
    openToRelocate: !!raw?.openToRelocate,
    noticePeriod: raw?.noticePeriod ?? "",
    employmentStatus: raw?.employmentStatus ?? "",
  };
}

export function labelForValue(
  value: string,
  chips: readonly { label: string; value: string }[]
) {
  return chips.find((c) => c.value === value)?.label ?? value;
}

export function valueForLabel(
  label: string,
  chips: readonly { label: string; value: string }[]
) {
  return chips.find((c) => c.label === label)?.value ?? label;
}
