export function normalizeWebsite(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

export function isValidWebsiteInput(raw: string): boolean {
  return normalizeWebsite(raw) !== null;
}
