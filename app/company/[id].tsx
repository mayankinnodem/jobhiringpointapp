import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchCompany } from "@/api/seeker";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { StackPageShell } from "@/components/navigation/StackPageShell";
import { colors, radius, spacing } from "@/theme";
import type { CompanyItem, JobListItem } from "@/types";

export default function CompanyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [company, setCompany] = useState<(CompanyItem & { jobs?: JobListItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      setCompany(await fetchCompany(id));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <StackPageShell title="Company">
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandLight} />
        </View>
      </StackPageShell>
    );
  }

  if (error || !company) {
    return (
      <StackPageShell title="Company">
        <EmptyState title="Company not found" subtitle={error ?? ""} actionLabel="Go back" onAction={() => router.back()} />
      </StackPageShell>
    );
  }

  const jobs = company.jobs ?? [];

  return (
    <StackPageShell title={company.name}>
        <FlatList
          data={jobs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
          ListHeaderComponent={
            <View>
              <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.hero}>
                <View style={styles.logo}>
                  <Text style={styles.logoLetter}>{company.name.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{company.name}</Text>
                {company.industry ? <Text style={styles.industry}>{company.industry}</Text> : null}
                {company.companySize ? (
                  <View style={styles.badge}>
                    <Ionicons name="people-outline" size={14} color={colors.brandLight} />
                    <Text style={styles.badgeText}>{company.companySize}</Text>
                  </View>
                ) : null}
              </LinearGradient>
              {company.description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.body}>{company.description}</Text>
                </View>
              ) : null}
              {company.website ? (
                <Text style={styles.link} onPress={() => void Linking.openURL(company.website!)}>
                  Visit website →
                </Text>
              ) : null}
              <Text style={styles.jobsHeading}>{jobs.length} open positions</Text>
            </View>
          }
          ListEmptyComponent={<EmptyState title="No open jobs" subtitle="Check back later for new openings." />}
          renderItem={({ item }) => (
            <JobCard job={item} onPress={() => router.push(`/job/${item._id}`)} />
          )}
        />
    </StackPageShell>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.md, paddingBottom: 32 },
  hero: { margin: spacing.md, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoLetter: { fontSize: 32, fontWeight: "800", color: colors.white },
  name: { fontSize: 22, fontWeight: "800", color: colors.white, textAlign: "center" },
  industry: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.brand, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22, color: colors.slate600 },
  link: { fontSize: 14, fontWeight: "700", color: colors.brandLight, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  jobsHeading: { fontSize: 16, fontWeight: "700", color: colors.brand, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
});
