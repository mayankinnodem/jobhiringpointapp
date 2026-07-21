import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchSavedJobs, unsaveJob } from "@/api/extras";
import { getApiErrorMessage } from "@/api/client";
import { appAlert } from "@/components/ui/AppAlert";
import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, spacing } from "@/theme";
import type { JobListItem } from "@/types";

export default function SavedScreen() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setJobs(await fetchSavedJobs());
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(jobId: string) {
    const prev = jobs;
    setJobs((j) => j.filter((x) => x._id !== jobId));
    try {
      await unsaveJob(jobId);
    } catch (e) {
      setJobs(prev);
      appAlert("Could not remove", getApiErrorMessage(e));
    }
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.header}>
          <Text style={styles.title}>Saved jobs</Text>
        </LinearGradient>
        <EmptyState title="Could not load" subtitle={error} actionLabel="Retry" onAction={() => { setLoading(true); void load(); }} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.header}>
        <Text style={styles.title}>Saved jobs</Text>
        <Text style={styles.sub}>Jobs you bookmarked for later</Text>
      </LinearGradient>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={jobs.length ? styles.list : styles.listEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.brandLight}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No saved jobs yet"
            subtitle="Tap the bookmark icon on any job to save it here."
            actionLabel="Browse jobs"
            onAction={() => router.push("/(tabs)")}
          />
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            saved
            onSave={() => void remove(item._id)}
            onPress={() => router.push(`/job/${item._id}`)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  list: { padding: spacing.md },
  listEmpty: { flexGrow: 1 },
});
