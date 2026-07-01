import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchRecommendedJobs } from "@/api/seeker";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, spacing } from "@/theme";
import type { JobListItem } from "@/types";

export default function RecommendedScreen() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setJobs(await fetchRecommendedJobs());
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

  return (
    <>
      <Stack.Screen options={{ title: "Recommended for you", headerTintColor: colors.brand }} />
      <Screen edges={["left", "right", "bottom"]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandLight} />
          </View>
        ) : error ? (
          <EmptyState title="Could not load" subtitle={error} actionLabel="Retry" onAction={() => { setLoading(true); void load(); }} />
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item._id}
            contentContainerStyle={jobs.length ? styles.list : styles.listEmpty}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
            ListHeaderComponent={
              <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.header}>
                <Ionicons name="sparkles" size={28} color={colors.brandLight} />
                <Text style={styles.title}>Recommended jobs</Text>
                <Text style={styles.sub}>Matched to your skills and profile</Text>
              </LinearGradient>
            }
            ListEmptyComponent={
              <EmptyState
                title="No recommendations yet"
                subtitle="Complete your profile with skills to get personalized job matches."
                actionLabel="Complete profile"
                onAction={() => router.push("/complete-profile")}
              />
            }
            renderItem={({ item }) => (
              <JobCard job={item} onPress={() => router.push(`/job/${item._id}`)} />
            )}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: 6,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center" },
  list: { paddingHorizontal: spacing.md, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
});
