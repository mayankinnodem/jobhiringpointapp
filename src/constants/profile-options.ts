export const HEADLINE_OPTIONS = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Digital Marketer",
  "Sales Executive",
  "HR Executive",
  "Accountant",
  "Content Writer",
  "Graphic Designer",
  "Nurse / Healthcare",
  "Teacher",
  "Fresh Graduate",
] as const;

export const CITY_OPTIONS = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Remote",
] as const;

export const SKILL_OPTIONS = [
  "React",
  "JavaScript",
  "Python",
  "Java",
  "Node.js",
  "SQL",
  "Excel",
  "Communication",
  "Sales",
  "Marketing",
  "HTML/CSS",
  "TypeScript",
  "AWS",
  "MongoDB",
  "Customer Support",
  "MS Office",
  "Accounting",
  "Content Writing",
  "SEO",
  "UI/UX",
  "Android",
  "iOS",
  "Data Entry",
  "Project Management",
] as const;

export const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: 0 },
  { label: "1 yr", value: 1 },
  { label: "2 yrs", value: 2 },
  { label: "3 yrs", value: 3 },
  { label: "5 yrs", value: 5 },
  { label: "7 yrs", value: 7 },
  { label: "10+ yrs", value: 10 },
] as const;

export const DEGREE_OPTIONS = [
  "B.Tech / BE",
  "BCA",
  "MCA",
  "B.Sc",
  "M.Sc",
  "MBA",
  "B.Com",
  "M.Com",
  "BA",
  "MA",
  "Diploma",
  "12th Pass",
  "10th Pass",
] as const;

export const INSTITUTION_OPTIONS = [
  "Delhi University",
  "Mumbai University",
  "Anna University",
  "VTU Karnataka",
  "IGNOU",
  "IIT / NIT",
  "BITS",
  "Private University",
  "Local College",
] as const;

export function graduationYears(count = 18) {
  const y = new Date().getFullYear();
  return Array.from({ length: count }, (_, i) => y - i);
}
