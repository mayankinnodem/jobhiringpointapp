export const DEFAULT_COUNTRY = "India";

export const INDIA_STATES: Record<string, readonly string[]> = {
  Delhi: ["New Delhi", "Delhi NCR"],
  Karnataka: ["Bangalore", "Mysore", "Mangalore"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Telangana: ["Hyderabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "West Bengal": ["Kolkata"],
  Gujarat: ["Ahmedabad", "Surat"],
  Rajasthan: ["Jaipur"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Ghaziabad"],
  Punjab: ["Chandigarh", "Ludhiana"],
  Kerala: ["Kochi"],
  "Madhya Pradesh": ["Indore", "Bhopal"],
  Remote: ["Remote / Work from home"],
};

export const INDIA_STATE_NAMES = Object.keys(INDIA_STATES);

export type LocationParts = {
  country: string;
  state: string;
  city: string;
};

export function formatLocation(parts: LocationParts): string {
  const country = parts.country.trim() || DEFAULT_COUNTRY;
  const state = parts.state.trim();
  const city = parts.city.trim();
  if (city && state && country) return `${city}, ${state}, ${country}`;
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  return "";
}

function findStateForCity(city: string): string {
  const needle = city.toLowerCase();
  for (const [state, cities] of Object.entries(INDIA_STATES)) {
    if (cities.some((c) => c.toLowerCase() === needle)) return state;
  }
  return "";
}

export function parseLocation(location?: string | null): LocationParts {
  const empty: LocationParts = { country: DEFAULT_COUNTRY, state: "", city: "" };
  if (!location?.trim()) return empty;
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return { city: parts[0], state: parts[1], country: parts[2] };
  }
  if (parts.length === 2) {
    return { city: parts[0], state: parts[1], country: DEFAULT_COUNTRY };
  }
  if (parts.length === 1) {
    return { city: parts[0], state: findStateForCity(parts[0]), country: DEFAULT_COUNTRY };
  }
  return empty;
}

export function citiesForState(state: string): string[] {
  return [...(INDIA_STATES[state] ?? [])];
}

export const HOME_CITY_SHORTCUTS: { label: string; parts: LocationParts }[] = [
  { label: "Bangalore", parts: { country: "India", state: "Karnataka", city: "Bangalore" } },
  { label: "Mumbai", parts: { country: "India", state: "Maharashtra", city: "Mumbai" } },
  { label: "Delhi NCR", parts: { country: "India", state: "Delhi", city: "Delhi NCR" } },
  { label: "Hyderabad", parts: { country: "India", state: "Telangana", city: "Hyderabad" } },
  { label: "Pune", parts: { country: "India", state: "Maharashtra", city: "Pune" } },
  { label: "Chennai", parts: { country: "India", state: "Tamil Nadu", city: "Chennai" } },
];
