import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fetchCompanies } from "@/api/seeker";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, shadow, spacing } from "@/theme";
import type { CompanyItem } from "@/types";

export default function CompaniesScreen() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (search?: string) => {
    try {
      setError(null);
      setCompanies(await fetchCompanies(search));
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
      <Stack.Screen options={{ title: "Companies", headerTintColor: colors.brand }} />
      <Screen edges={["left", "right", "bottom"]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.slate400} />
          <TextInput
            style={styles.search}
            placeholder="Search companies…"
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => { setLoading(true); void load(q); }}
            returnKeyType="search"
            placeholderTextColor={colors.slate400}
          />
        </View>
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandLight} />
          </View>
        ) : error ? (
          <EmptyState title="Could not load" subtitle={error} actionLabel="Retry" onAction={() => { setLoading(true); void load(q); }} />
        ) : (
          <FlatList
            data={companies}
            keyExtractor={(item) => item._id}
            contentContainerStyle={companies.length ? styles.list : styles.listEmpty}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(q); }} />}
            ListEmptyComponent={<EmptyState title="No companies found" subtitle="Try a different search." />}
            renderItem={({ item }) => (
              <Pressable style={styles.card} onPress={() => router.push(`/company/${item._id}`)}>
                <View style={styles.logo}>
                  <Text style={styles.logoLetter}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.industry ? <Text style={styles.industry}>{item.industry}</Text> : null}
                  <Text style={styles.jobs}>{item.jobCount ?? 0} open jobs</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.slate400} />
              </Pressable>
            )}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  search: { flex: 1, fontSize: 15, paddingVertical: 12, color: colors.slate900 },
  list: { paddingHorizontal: spacing.md, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  logoLetter: { fontSize: 20, fontWeight: "800", color: colors.brand },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.brand },
  industry: { fontSize: 12, color: colors.slate500, marginTop: 2 },
  jobs: { fontSize: 12, fontWeight: "600", color: colors.brandLight, marginTop: 4 },
});
