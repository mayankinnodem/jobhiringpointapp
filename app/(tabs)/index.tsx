import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchJobs } from "@/api/jobs";
import { fetchSeekerProfile } from "@/api/profile";
import { fetchSavedJobIds, fetchUnreadCount, saveJob, unsaveJob } from "@/api/extras";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { HomeHeader } from "@/components/HomeHeader";
import { JobCard } from "@/components/JobCard";
import { ProfileCompleteBanner } from "@/components/ProfileCompleteBanner";
import { colors, radius, shadow, spacing } from "@/theme";
import { useAuthStore } from "@/store/authStore";
import type { JobListItem } from "@/types";

const TAB_BAR_CORE = Platform.OS === "ios" ? 56 : 62;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "remote", label: "Remote" },
  { key: "full_time", label: "Full-time" },
  { key: "internship", label: "Internship" },
] as const;

export default function JobsScreen() {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  const listBottomPad = insets.bottom + TAB_BAR_CORE + spacing.xl;

  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState(0);
  const [profilePercent, setProfilePercent] = useState(0);
  const [profileMissing, setProfileMissing] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (search?: string, jobType?: string, pageNum = 1, append = false) => {
    try {
      setError(null);
      const params: { q?: string; jobType?: string; page: number; limit: number } = {
        page: pageNum,
        limit: 20,
      };
      if (search) params.q = search;
      if (jobType && jobType !== "all") params.jobType = jobType;

      const profileP =
        user?.role === "job_seeker"
          ? fetchSeekerProfile().catch(() => null)
          : Promise.resolve(null);

      const [data, unreadN, saved, profileData] = await Promise.all([
        fetchJobs(params),
        user ? fetchUnreadCount().catch(() => 0) : Promise.resolve(0),
        user?.role === "job_seeker"
          ? fetchSavedJobIds().catch(() => new Set<string>())
          : Promise.resolve(new Set<string>()),
        profileP,
      ]);

      setJobs((prev) => (append ? [...prev, ...data.jobs] : data.jobs));
      const pagination = data.meta?.pagination;
      setTotal(pagination?.total ?? data.jobs.length);
      setHasMore(pagination ? pageNum < (pagination.totalPages ?? 1) : false);
      setPage(pageNum);
      setUnread(unreadN);
      setSavedIds(saved);
      if (profileData) {
        setProfilePercent(profileData.canApply.percent);
        setProfileMissing(profileData.canApply.missing);
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void load(q, filter, 1, false);
  }, [load, q, filter]);

  async function toggleSave(jobId: string) {
    if (user?.role !== "job_seeker") return;
    const isSaved = savedIds.has(jobId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    try {
      if (isSaved) await unsaveJob(jobId);
      else await saveJob(jobId);
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    }
  }

  const searchBar = (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={20} color={colors.slate400} />
      <TextInput
        style={styles.search}
        placeholder="Search jobs, skills, city…"
        placeholderTextColor={colors.slate400}
        value={q}
        onChangeText={setQ}
        onSubmitEditing={() => {
          setLoading(true);
          void load(q, filter);
        }}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {q ? (
        <Pressable
          hitSlop={8}
          onPress={() => {
            setQ("");
            void load("", filter);
          }}
        >
          <Ionicons name="close-circle" size={20} color={colors.slate400} />
        </Pressable>
      ) : null}
    </View>
  );

  const listHeader = (
    <View>
      <HomeHeader user={user} unread={unread} searchSlot={searchBar} />
      {user?.role === "job_seeker" ? (
        <ProfileCompleteBanner percent={profilePercent} missing={profileMissing} />
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filterScroll}
      >
        {FILTERS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.chip, filter === item.key && styles.chipOn]}
            onPress={() => {
              setFilter(item.key);
              setLoading(true);
            }}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextOn]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {jobs.length > 0 ? (
        <Text style={styles.resultCount}>{total || jobs.length} jobs found</Text>
      ) : null}
    </View>
  );

  if (loading && !refreshing && jobs.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <HomeHeader user={user} unread={unread} searchSlot={searchBar} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandLight} />
        </View>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        {listHeader}
        <EmptyState
          title="Could not load jobs"
          subtitle={error}
          actionLabel="Retry"
          onAction={() => {
            setLoading(true);
            void load(q, filter);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        style={styles.listFill}
        contentContainerStyle={[
          jobs.length ? styles.listContent : styles.listEmpty,
          { paddingBottom: listBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load(q, filter, 1, false);
            }}
            tintColor={colors.brandLight}
          />
        }
        onEndReached={() => {
          if (!loadingMore && hasMore && !loading) {
            setLoadingMore(true);
            void load(q, filter, page + 1, true);
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 16 }} color={colors.brandLight} />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState title="No jobs match your search" subtitle="Try different keywords or filters." />
        }
        renderItem={({ item }) => (
          <View style={styles.jobRow}>
            <JobCard
              job={item}
              saved={savedIds.has(item._id)}
              onSave={user?.role === "job_seeker" ? () => void toggleSave(item._id) : undefined}
              onPress={() => router.push(`/job/${item._id}`)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand50 },
  listFill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    minHeight: 50,
    ...shadow.float,
  },
  search: {
    flex: 1,
    fontSize: 15,
    color: colors.slate900,
    paddingVertical: 12,
  },
  filterScroll: { marginTop: spacing.sm, marginBottom: spacing.xs },
  filters: {
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.slate500 },
  chipTextOn: { color: colors.white },
  listContent: { flexGrow: 0 },
  listEmpty: { flexGrow: 1 },
  jobRow: { paddingHorizontal: spacing.md, marginBottom: 2 },
  resultCount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.slate400,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});
