import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  fetchApplications,
  fetchRecruiterDashboard,
  fetchRecruiterJobs,
  withdrawApplication,
} from "@/api/jobs";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, shadow, spacing } from "@/theme";
import type { ApplicationItem, JobListItem } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  applied: colors.brand,
  shortlisted: colors.brandLight,
  interview_scheduled: "#8b5cf6",
  hired: colors.success,
  rejected: colors.red,
  withdrawn: colors.slate400,
};

export default function ApplicationsScreen() {
  const user = useAuthStore((s) => s.user);
  const isSeeker = user?.role === "job_seeker";
  const isRecruiter = user?.role === "recruiter";

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [recruiterJobs, setRecruiterJobs] = useState<JobListItem[]>([]);
  const [stats, setStats] = useState<{
    totalJobs: number;
    publishedJobs: number;
    totalApplications: number;
    pendingJobs: number;
    totalViews: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      if (isSeeker) {
        setApplications(await fetchApplications());
      } else if (isRecruiter) {
        const [s, jobs] = await Promise.all([fetchRecruiterDashboard(), fetchRecruiterJobs()]);
        setStats(s);
        setRecruiterJobs(jobs);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSeeker, isRecruiter]);

  useEffect(() => {
    void load();
  }, [load]);

  function confirmWithdraw(app: ApplicationItem) {
    if (app.status === "hired" || app.status === "withdrawn") return;
    Alert.alert("Withdraw", "Withdraw this application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: () => {
          void withdrawApplication(app._id)
            .then(() => setApplications((prev) => prev.filter((a) => a._id !== app._id)))
            .catch((e) => Alert.alert("Error", getApiErrorMessage(e)));
        },
      },
    ]);
  }

  if (loading && !refreshing) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  if (error) {
    return (
      <EmptyState title="Could not load" subtitle={error} actionLabel="Retry" onAction={() => { setLoading(true); void load(); }} />
    );
  }

  if (isRecruiter) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.header}>
          <Text style={styles.title}>Recruiter dashboard</Text>
          <Text style={styles.sub}>Manage jobs and review applicants</Text>
          <Pressable style={styles.postBtn} onPress={() => router.push("/recruiter/post-job")}>
            <Ionicons name="add" size={20} color={colors.brand} />
            <Text style={styles.postBtnText}>Post new job</Text>
          </Pressable>
        </LinearGradient>

        {stats ? (
          <View style={styles.statsGrid}>
            <StatCard icon="briefcase" label="Total jobs" value={stats.totalJobs} />
            <StatCard icon="checkmark-circle" label="Published" value={stats.publishedJobs} color={colors.success} />
            <StatCard icon="people" label="Applications" value={stats.totalApplications} />
            <StatCard icon="eye" label="Total views" value={stats.totalViews} color={colors.brandLight} />
          </View>
        ) : null}

        <FlatList
          data={recruiterJobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Your job posts</Text>}
          ListEmptyComponent={
            <EmptyState
              title="No jobs posted"
              subtitle="Create your company profile and post your first job."
              actionLabel="Post a job"
              onAction={() => router.push("/recruiter/post-job")}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Pressable onPress={() => router.push(`/job/${item._id}`)}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobMeta}>
                  {item.location} · {item.status.replace(/_/g, " ")}
                </Text>
              </Pressable>
              <View style={styles.jobActions}>
                <Pressable style={styles.actionBtn} onPress={() => router.push(`/recruiter/applicants/${item._id}`)}>
                  <Ionicons name="people-outline" size={18} color={colors.brand} />
                  <Text style={styles.actionText}>Applicants</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => router.push(`/recruiter/post-job?id=${item._id}`)}>
                  <Ionicons name="create-outline" size={18} color={colors.brand} />
                  <Text style={styles.actionText}>Edit</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.header}>
        <Text style={styles.title}>My applications</Text>
        <Text style={styles.sub}>Track every job you applied to</Text>
      </LinearGradient>

      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={applications.length ? styles.list : styles.listEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
        ListEmptyComponent={
          <EmptyState
            title="No applications yet"
            subtitle="Apply to jobs and track your application status in one place."
            actionLabel="Find jobs"
            onAction={() => router.push("/(tabs)")}
          />
        }
        renderItem={({ item }) => {
          const status = item.status.replace(/_/g, " ");
          const color = STATUS_COLORS[item.status] ?? colors.brand;
          const canWithdraw = item.status !== "hired" && item.status !== "withdrawn";
          return (
            <View style={styles.appCard}>
              <View style={styles.appTop}>
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={[styles.status, { color }]}>{status}</Text>
              </View>
              <Text style={styles.appTitle}>{item.jobId?.title ?? "Job"}</Text>
              <Text style={styles.appMeta}>
                Applied {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </Text>
              <View style={styles.appLinks}>
                {item.jobId?._id ? (
                  <Text style={styles.viewLink} onPress={() => router.push(`/job/${item.jobId!._id}`)}>
                    View job →
                  </Text>
                ) : null}
                {canWithdraw ? (
                  <Text style={styles.withdrawLink} onPress={() => confirmWithdraw(item)}>
                    Withdraw
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}

function StatCard({ icon, label, value, color = colors.brand }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  postBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    marginTop: 12, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
  },
  postBtnText: { fontSize: 13, fontWeight: "700", color: colors.brand },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: spacing.md, marginTop: -8 },
  statCard: { width: "47%", backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, ...shadow.card, borderWidth: 1, borderColor: colors.brand100 },
  statValue: { fontSize: 26, fontWeight: "800", marginTop: 8 },
  statLabel: { fontSize: 12, color: colors.slate400, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.brand, marginBottom: 12, paddingHorizontal: spacing.md },
  list: { padding: spacing.md, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
  jobCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.brand100, ...shadow.card },
  jobTitle: { fontSize: 16, fontWeight: "700", color: colors.brand },
  jobMeta: { fontSize: 13, color: colors.slate400, marginTop: 4, textTransform: "capitalize" },
  jobActions: { flexDirection: "row", gap: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.brand100, paddingTop: 12 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, fontWeight: "700", color: colors.brand },
  appCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.brand100, ...shadow.card },
  appTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  status: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  appTitle: { fontSize: 16, fontWeight: "700", color: colors.brand },
  appMeta: { fontSize: 13, color: colors.slate400, marginTop: 4 },
  appLinks: { flexDirection: "row", gap: 20, marginTop: 10 },
  viewLink: { fontSize: 13, fontWeight: "700", color: colors.brand },
  withdrawLink: { fontSize: 13, fontWeight: "700", color: colors.red },
});
