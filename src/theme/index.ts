export const colors = {
  brand: "#002d62",
  brandDark: "#001a3d",
  brandLight: "#ff8c00",
  brandLighter: "#ffa033",
  brand50: "#eef2f8",
  brand100: "#d6e0ef",
  brand200: "#b0c4dc",
  success: "#4caf50",
  successBg: "#ecfdf5",
  white: "#ffffff",
  black: "#0f172a",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate900: "#0f172a",
  red: "#ef4444",
  redBg: "#fef2f2",
  gold: "#c9a227",
};

/** Shared navy gradient for splash, auth, and home header. */
export const brandGradient = ["#001a3d", "#002d62", "#003d82"] as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: "#002d62",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  float: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const typography = {
  hero: { fontSize: 28, fontWeight: "800" as const, color: colors.brand },
  h1: { fontSize: 22, fontWeight: "800" as const, color: colors.brand },
  h2: { fontSize: 18, fontWeight: "700" as const, color: colors.brand },
  body: { fontSize: 15, lineHeight: 22, color: colors.slate600 },
  caption: { fontSize: 12, color: colors.slate400 },
  label: { fontSize: 13, fontWeight: "600" as const, color: colors.brand },
};
