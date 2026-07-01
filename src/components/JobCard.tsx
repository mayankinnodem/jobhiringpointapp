import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, shadow } from "@/theme";
import type { JobListItem } from "@/types";

function companyName(job: JobListItem) {
  const c = job.companyId;
  if (!c || typeof c === "string") return "Company";
  return c.name;
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Negotiable";
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const jobTypeLabel: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

export function JobCard({
  job,
  onPress,
  onSave,
  saved,
}: {
  job: JobListItem;
  onPress: () => void;
  onSave?: () => void;
  saved?: boolean;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>{companyName(job).charAt(0)}</Text>
        </View>
        <View style={styles.topText}>
          <Text style={styles.title} numberOfLines={2}>
            {job.title}
          </Text>
          <Text style={styles.company}>{companyName(job)}</Text>
        </View>
        {onSave ? (
          <Pressable onPress={onSave} hitSlop={12} style={styles.saveBtn}>
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={saved ? colors.brandLight : colors.slate400}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <MetaChip icon="location-outline" text={job.location} />
        <MetaChip icon="cash-outline" text={formatSalary(job.salaryMin, job.salaryMax)} />
      </View>

      {job.jobType ? (
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{jobTypeLabel[job.jobType] ?? job.jobType}</Text>
          </View>
          {job.isFeatured ? (
            <View style={styles.featured}>
              <Ionicons name="star" size={10} color={colors.white} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {job.requiredSkills?.length ? (
        <View style={styles.skills}>
          {job.requiredSkills.slice(0, 4).map((s) => (
            <View key={s} style={styles.skill}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.posted}>
          Posted {new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </Text>
        <View style={styles.applyHint}>
          <Text style={styles.applyText}>View</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.brandLight} />
        </View>
      </View>
    </Pressable>
  );
}

function MetaChip({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={14} color={colors.brand} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
    overflow: "hidden",
  },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  logoLetter: { color: colors.brand, fontSize: 20, fontWeight: "800" },
  topText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: colors.brand, lineHeight: 22 },
  company: { fontSize: 13, color: colors.slate500, marginTop: 2 },
  saveBtn: { padding: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brand50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    maxWidth: "48%",
  },
  metaText: { fontSize: 12, color: colors.slate600, fontWeight: "500", flexShrink: 1 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeBadge: {
    backgroundColor: colors.brand100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  typeText: { fontSize: 11, fontWeight: "600", color: colors.brand },
  featured: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  featuredText: { fontSize: 10, fontWeight: "700", color: colors.white },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  skill: {
    borderWidth: 1,
    borderColor: colors.brand100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillText: { fontSize: 11, color: colors.slate500, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
    paddingTop: 10,
  },
  posted: { fontSize: 11, color: colors.slate400 },
  applyHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  applyText: { fontSize: 13, fontWeight: "700", color: colors.brand },
});
