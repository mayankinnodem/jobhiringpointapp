import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  applyToJob,
  fetchJob,
  fetchJobMatch,
  fetchSeekerState,
  fetchSimilarJobs,
  withdrawApplication,
} from "@/api/jobs";
import { fetchSeekerProfile } from "@/api/profile";
import { getApiErrorMessage } from "@/api/client";
import { saveJob, unsaveJob } from "@/api/extras";
import { AppButton } from "@/components/ui/AppButton";
import { JobCard } from "@/components/JobCard";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, shadow, spacing } from "@/theme";
import type { JobListItem, RecruiterRef } from "@/types";

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function recruiterIdFromJob(job: JobListItem): string | null {
  const r = job.recruiterId;
  if (!r) return null;
  if (typeof r === "string") return r;
  return r._id;
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [job, setJob] = useState<JobListItem | null>(null);
  const [similar, setSimilar] = useState<JobListItem[]>([]);
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [applied, setApplied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const j = await fetchJob(id);
      setJob(j);
      const similarJobs = await fetchSimilarJobs(id).catch(() => []);
      setSimilar(similarJobs);
      if (user?.role === "job_seeker") {
        const [state, match] = await Promise.all([
          fetchSeekerState(id),
          fetchJobMatch(id).catch(() => null),
        ]);
        setApplied(state.applied);
        setStatus(state.status ?? null);
        setApplicationId(state.applicationId ?? null);
        setSaved(!!state.saved);
        if (match) setMatchPercent(match.percent);
      }
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onApply() {
    if (!id) return;
    setApplying(true);
    try {
      const { canApply } = await fetchSeekerProfile();
      if (!canApply.allowed) {
        appAlert(
          "Complete your profile",
          `Your profile is ${canApply.percent}% complete. Finish the required fields to apply.`,
          [
            { text: "Later", style: "cancel" },
            {
              text: "Complete now",
              onPress: () => router.push(`/complete-profile?returnTo=/job/${id}`),
            },
          ]
        );
        return;
      }
      await applyToJob(id, coverLetter);
      setApplied(true);
      setStatus("applied");
      appAlert("Applied!", "Your application was submitted successfully.");
      void load();
    } catch (e) {
      const err = e as { response?: { data?: { profileIncomplete?: boolean } } };
      if (err.response?.data?.profileIncomplete) {
        appAlert(
          "Complete your profile",
          "Finish your profile before applying to this job.",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Complete now",
              onPress: () => router.push(`/complete-profile?returnTo=/job/${id}`),
            },
          ]
        );
        return;
      }
      appAlert("Could not apply", getApiErrorMessage(e));
    } finally {
      setApplying(false);
    }
  }

  async function onWithdraw() {
    if (!applicationId) return;
    appAlert("Withdraw application", "Are you sure you want to withdraw?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => {
          setWithdrawing(true);
          void withdrawApplication(applicationId)
            .then(() => {
              setApplied(false);
              setStatus(null);
              setApplicationId(null);
              appAlert("Withdrawn", "Application withdrawn.");
            })
            .catch((e) => appAlert("Error", getApiErrorMessage(e)))
            .finally(() => setWithdrawing(false));
        },
      },
    ]);
  }

  async function toggleSave() {
    if (!id) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveJob(id);
        setSaved(false);
      } else {
        await saveJob(id);
        setSaved(true);
      }
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  function openChat() {
    if (!job || !id) return;
    const recruiterId = recruiterIdFromJob(job);
    if (!recruiterId) return;
    const recruiter = job.recruiterId as RecruiterRef | undefined;
    const name = recruiter?.name ?? "Recruiter";
    router.push(`/chat?jobId=${id}&peerUserId=${recruiterId}&peerName=${encodeURIComponent(name)}`);
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  if (!job) {
    return (
      <Screen style={styles.center}>
        <Ionicons name="search-outline" size={48} color={colors.slate400} />
        <Text style={styles.muted}>Job not found</Text>
      </Screen>
    );
  }

  const company =
    typeof job.companyId === "object" && job.companyId?.name
      ? job.companyId.name
      : "Company";
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const isSeeker = user?.role === "job_seeker";
  const isRecruiterOwner = user?.role === "recruiter" && recruiterIdFromJob(job) === user.id;

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.hero}>
          {job.isFeatured ? (
            <View style={styles.featured}>
              <Ionicons name="star" size={12} color={colors.white} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          ) : null}
          {matchPercent != null ? (
            <View style={styles.matchBadge}>
              <Ionicons name="flash" size={14} color={colors.white} />
              <Text style={styles.matchText}>{matchPercent}% skill match</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{job.title}</Text>
          <View style={styles.companyRow}>
            <View style={styles.companyAvatar}>
              <Text style={styles.companyInitial}>{company.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.company}>{company}</Text>
              {typeof job.companyId === "object" && job.companyId?.industry ? (
                <Text style={styles.industry}>{job.companyId.industry}</Text>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.metaCard}>
          <MetaChip icon="location-outline" label={job.location} />
          {salary ? <MetaChip icon="cash-outline" label={salary} /> : null}
          {job.experienceMinYears != null ? (
            <MetaChip icon="time-outline" label={`${job.experienceMinYears}+ yrs`} />
          ) : null}
          {job.jobType ? (
            <MetaChip icon="briefcase-outline" label={job.jobType.replace(/_/g, " ")} />
          ) : null}
        </View>

        {job.requiredSkills?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required skills</Text>
            <View style={styles.skills}>
              {job.requiredSkills.map((s) => (
                <View key={s} style={styles.skill}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this role</Text>
          <Text style={styles.body}>{stripHtml(job.descriptionHtml) || "No description provided."}</Text>
        </View>

        {isSeeker && !applied ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cover letter (optional)</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="Why are you a good fit for this role?"
              placeholderTextColor={colors.slate400}
            />
          </View>
        ) : null}

        {similar.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar jobs</Text>
            {similar.map((s) => (
              <JobCard key={s._id} job={s} onPress={() => router.push(`/job/${s._id}`)} />
            ))}
          </View>
        ) : null}

        <View style={{ height: isSeeker || isRecruiterOwner ? 120 : 24 }} />
      </ScrollView>

      {isSeeker ? (
        <View style={styles.footer}>
          <Pressable style={styles.saveBtn} onPress={() => void toggleSave()} disabled={saving}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={24} color={saved ? colors.brandLight : colors.brand} />
          </Pressable>
          {applied ? (
            <View style={styles.appliedCol}>
              <View style={styles.appliedBar}>
                <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                <Text style={styles.appliedText}>Applied — {status?.replace(/_/g, " ") ?? "applied"}</Text>
              </View>
              <View style={styles.appliedActions}>
                {status !== "withdrawn" && status !== "hired" ? (
                  <Pressable onPress={() => void onWithdraw()} disabled={withdrawing}>
                    <Text style={styles.withdrawText}>{withdrawing ? "Withdrawing…" : "Withdraw"}</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={openChat}>
                  <Text style={styles.chatLink}>Message recruiter</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <AppButton label="Apply now" onPress={() => void onApply()} loading={applying} style={styles.applyBtn} />
          )}
        </View>
      ) : null}

      {isRecruiterOwner ? (
        <View style={styles.footer}>
          <AppButton label="View applicants" onPress={() => router.push(`/recruiter/applicants/${id}`)} style={{ flex: 1 }} />
          <AppButton label="Edit job" variant="outline" onPress={() => router.push(`/recruiter/post-job?id=${id}`)} style={{ flex: 1 }} />
        </View>
      ) : null}
    </Screen>
  );
}

function MetaChip({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={colors.brandLight} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.brand50 },
  content: { paddingBottom: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  muted: { color: colors.slate400, fontSize: 16 },
  hero: { padding: spacing.lg, paddingTop: spacing.md, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  featured: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    backgroundColor: colors.brandLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, marginBottom: 10,
  },
  featuredText: { fontSize: 11, fontWeight: "700", color: colors.white },
  matchBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, marginBottom: 8,
  },
  matchText: { fontSize: 11, fontWeight: "700", color: colors.white },
  title: { fontSize: 24, fontWeight: "800", color: colors.white, lineHeight: 30 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 },
  companyAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  companyInitial: { fontSize: 18, fontWeight: "800", color: colors.white },
  company: { fontSize: 16, fontWeight: "700", color: colors.white },
  industry: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  metaCard: {
    flexDirection: "row", flexWrap: "wrap", gap: 8, marginHorizontal: spacing.md, marginTop: -16,
    backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow.float, borderWidth: 1, borderColor: colors.brand100,
  },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.brand50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.brand, textTransform: "capitalize" },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.brand, marginBottom: 10 },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skill: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.brand100 },
  skillText: { fontSize: 12, fontWeight: "600", color: colors.brand },
  body: { fontSize: 15, lineHeight: 24, color: colors.slate600 },
  textarea: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brand100, borderRadius: radius.md,
    padding: 14, minHeight: 110, textAlignVertical: "top", fontSize: 15, color: colors.slate900,
  },
  footer: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.md,
    paddingVertical: 12, paddingBottom: 20, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.brand100, ...shadow.float,
  },
  saveBtn: { width: 52, height: 52, borderRadius: radius.md, borderWidth: 2, borderColor: colors.brand100, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand50 },
  applyBtn: { flex: 1 },
  appliedCol: { flex: 1, gap: 6 },
  appliedBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.successBg, borderRadius: radius.md, paddingVertical: 12 },
  appliedText: { fontSize: 14, fontWeight: "700", color: colors.success, textTransform: "capitalize" },
  appliedActions: { flexDirection: "row", justifyContent: "center", gap: 20 },
  withdrawText: { fontSize: 13, fontWeight: "700", color: colors.red },
  chatLink: { fontSize: 13, fontWeight: "700", color: colors.brand },
});
