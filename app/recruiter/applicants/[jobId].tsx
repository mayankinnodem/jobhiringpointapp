import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchJobApplicants, updateApplicationStatus } from "@/api/recruiter";
import { getApiErrorMessage } from "@/api/client";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, shadow, spacing } from "@/theme";
import type { ApplicationStatus } from "@/types";
import type { RecruiterApplicant } from "@/api/recruiter";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "applied",
  "shortlisted",
  "interview_scheduled",
  "hired",
  "rejected",
];

export default function ApplicantsScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<RecruiterApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!jobId) return;
    try {
      setApplicants(await fetchJobApplicants(jobId));
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  function changeStatus(app: RecruiterApplicant) {
    const buttons: { text: string; onPress?: () => void; style?: "cancel" | "destructive" }[] =
      STATUS_OPTIONS.map((status) => ({
        text: status.replace(/_/g, " "),
        onPress: () => {
          void updateApplicationStatus(app._id, { status })
            .then((updated) => {
              setApplicants((prev) =>
                prev.map((a) => (a._id === app._id ? { ...a, status: updated.status } : a))
              );
            })
            .catch((e) => appAlert("Error", getApiErrorMessage(e)));
        },
      }));
    buttons.push({ text: "Cancel", style: "cancel" });
    appAlert("Update status", `${app.seekerId?.name ?? "Applicant"}`, buttons);
  }

  if (loading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.brandLight} />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Applicants", headerTintColor: colors.brand }} />
      <Screen edges={["left", "right", "bottom"]}>
        <FlatList
          data={applicants}
          keyExtractor={(item) => item._id}
          contentContainerStyle={applicants.length ? styles.list : styles.listEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
          ListEmptyComponent={<EmptyState title="No applicants yet" subtitle="Share your job listing to attract candidates." />}
          renderItem={({ item }) => {
            const name = item.seekerId?.name ?? "Applicant";
            const seekerId = item.seekerId?._id;
            return (
              <View style={styles.card}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name}>{name}</Text>
                  {item.profile?.headline ? <Text style={styles.headline}>{item.profile.headline}</Text> : null}
                  {item.profile?.skills?.length ? (
                    <Text style={styles.skills}>{item.profile.skills.slice(0, 4).join(" · ")}</Text>
                  ) : null}
                  <Pressable style={styles.statusBtn} onPress={() => changeStatus(item)}>
                    <Text style={styles.status}>{item.status.replace(/_/g, " ")}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.brand} />
                  </Pressable>
                </View>
                {seekerId && jobId ? (
                  <Pressable
                    style={styles.chatBtn}
                    onPress={() =>
                      router.push(
                        `/chat?jobId=${jobId}&peerUserId=${seekerId}&peerName=${encodeURIComponent(name)}`
                      )
                    }
                  >
                    <Ionicons name="chatbubble-outline" size={22} color={colors.brand} />
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, paddingBottom: 32 },
  listEmpty: { flexGrow: 1 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: colors.brand },
  body: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: colors.brand },
  headline: { fontSize: 13, color: colors.slate500, marginTop: 2 },
  skills: { fontSize: 12, color: colors.slate400, marginTop: 4 },
  statusBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: colors.brand50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  status: { fontSize: 12, fontWeight: "700", color: colors.brand, textTransform: "capitalize" },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
});
