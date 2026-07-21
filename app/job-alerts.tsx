import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  createJobAlert,
  deleteJobAlert,
  fetchJobAlerts,
  updateJobAlert,
} from "@/api/seeker";
import { getApiErrorMessage } from "@/api/client";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { colors, radius, shadow, spacing } from "@/theme";
import type { JobAlertItem } from "@/types";

export default function JobAlertsScreen() {
  const [alerts, setAlerts] = useState<JobAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setAlerts(await fetchJobAlerts());
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate() {
    if (!name.trim()) {
      appAlert("Name required", "Give your alert a name.");
      return;
    }
    setSaving(true);
    try {
      const alert = await createJobAlert({
        name: name.trim(),
        keywords: keywords.trim(),
        location: location.trim(),
      });
      setAlerts((prev) => [alert, ...prev]);
      setName("");
      setKeywords("");
      setLocation("");
      setShowForm(false);
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(alert: JobAlertItem) {
    try {
      const updated = await updateJobAlert(alert._id, { isActive: !alert.isActive });
      setAlerts((prev) => prev.map((a) => (a._id === alert._id ? updated : a)));
    } catch (e) {
      appAlert("Error", getApiErrorMessage(e));
    }
  }

  function confirmDelete(alert: JobAlertItem) {
    appAlert("Delete alert", `Remove "${alert.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteJobAlert(alert._id).then(() => {
            setAlerts((prev) => prev.filter((a) => a._id !== alert._id));
          });
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: "Job alerts", headerTintColor: colors.brand }} />
      <Screen edges={["left", "right", "bottom"]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandLight} />
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />}
            ListHeaderComponent={
              <View style={styles.header}>
                <Text style={styles.heading}>Get notified when new jobs match</Text>
                {!showForm ? (
                  <AppButton label="Create alert" onPress={() => setShowForm(true)} />
                ) : (
                  <View style={styles.form}>
                    <TextInput style={styles.input} placeholder="Alert name" value={name} onChangeText={setName} placeholderTextColor={colors.slate400} />
                    <TextInput style={styles.input} placeholder="Keywords (e.g. React, Python)" value={keywords} onChangeText={setKeywords} placeholderTextColor={colors.slate400} />
                    <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} placeholderTextColor={colors.slate400} />
                    <View style={styles.formBtns}>
                      <AppButton label="Save alert" onPress={() => void onCreate()} loading={saving} />
                      <AppButton label="Cancel" variant="outline" onPress={() => setShowForm(false)} />
                    </View>
                  </View>
                )}
              </View>
            }
            ListEmptyComponent={
              !showForm ? (
                <EmptyState icon="notifications-outline" title="No alerts yet" subtitle="Create an alert to get notified about matching jobs." />
              ) : null
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Pressable onPress={() => confirmDelete(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color={colors.red} />
                  </Pressable>
                </View>
                {item.keywords ? <Text style={styles.meta}>Keywords: {item.keywords}</Text> : null}
                {item.location ? <Text style={styles.meta}>Location: {item.location}</Text> : null}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Active</Text>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => void toggleActive(item)}
                    trackColor={{ true: colors.brandLight }}
                  />
                </View>
              </View>
            )}
          />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: spacing.md, paddingBottom: 32 },
  header: { marginBottom: spacing.md, gap: 12 },
  heading: { fontSize: 15, color: colors.slate600, lineHeight: 22 },
  form: { gap: 10, backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.brand100, ...shadow.card },
  input: { borderWidth: 1, borderColor: colors.brand100, borderRadius: radius.md, padding: 12, fontSize: 15, color: colors.slate900 },
  formBtns: { gap: 8 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: 10, borderWidth: 1, borderColor: colors.brand100, ...shadow.card },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.brand, flex: 1 },
  meta: { fontSize: 13, color: colors.slate500, marginTop: 4 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: colors.slate600 },
});
