import { router } from "expo-router";
import { appAlert } from "@/components/ui/AppAlert";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  fetchRoleSwitchEligibility,
  switchAccountRole,
  type RoleSwitchEligibility,
} from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { onboardingForRole } from "@/lib/auth-redirect";
import { colors, radius, spacing } from "@/theme";

function roleLabel(role: string) {
  return role === "recruiter" ? "Recruiter" : "Job Seeker";
}

export function SwitchRoleCard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [eligibility, setEligibility] = useState<RoleSwitchEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== "job_seeker" && user.role !== "recruiter")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    void fetchRoleSwitchEligibility()
      .then(setEligibility)
      .catch((e) => setFetchError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [user?.role, user]);

  if (!user || (user.role !== "job_seeker" && user.role !== "recruiter")) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Account type</Text>
        <Text style={styles.body}>Checking…</Text>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Account type</Text>
        <Text style={styles.blocker}>{fetchError}</Text>
        <Pressable
          onPress={() => {
            setLoading(true);
            setFetchError(null);
            void fetchRoleSwitchEligibility()
              .then(setEligibility)
              .catch((e) => setFetchError(getApiErrorMessage(e)))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.link}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!eligibility) {
    return null;
  }

  function confirmSwitch() {
    if (!eligibility?.canSwitch) return;
    const target = eligibility.targetRole;
    appAlert(
      "Switch account type?",
      `Change from ${roleLabel(eligibility.currentRole)} to ${roleLabel(target)}? Your saved data stays on your account.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: () => {
            void (async () => {
              setSwitching(true);
              try {
                const updated = await switchAccountRole(target);
                setUser(updated);
                appAlert(
                  "Account updated",
                  `You are now a ${roleLabel(updated.role)}.`,
                  [
                    {
                      text: "Continue",
                      onPress: () =>
                        router.replace(
                          onboardingForRole(updated.role) as "/complete-profile"
                        ),
                    },
                  ]
                );
              } catch (e) {
                appAlert("Could not switch", getApiErrorMessage(e));
                try {
                  setEligibility(await fetchRoleSwitchEligibility());
                } catch {
                  /* ignore */
                }
              } finally {
                setSwitching(false);
              }
            })();
          },
        },
      ]
    );
  }

  const target = roleLabel(eligibility.targetRole);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.meta}>
          <Text style={styles.label}>Account type</Text>
          <Text style={styles.value}>{roleLabel(eligibility.currentRole)}</Text>
          <Text style={styles.body}>
            Need to hire or apply instead? You can switch to {target}.
          </Text>
          {eligibility.blockers.length > 0 ? (
            <Text style={styles.blocker}>{eligibility.blockers.join("\n")}</Text>
          ) : null}
        </View>
      </View>
      <Pressable
        style={[styles.btn, (!eligibility.canSwitch || switching) && styles.btnOff]}
        disabled={!eligibility.canSwitch || switching}
        onPress={confirmSwitch}
      >
        <Text style={styles.btnText}>
          {switching ? "Switching…" : `Switch to ${target}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.brand100,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: "row", alignItems: "flex-start" },
  meta: { flex: 1 },
  label: { fontSize: 15, fontWeight: "700", color: colors.brand },
  value: { fontSize: 13, fontWeight: "600", color: colors.slate500, marginTop: 2 },
  body: { fontSize: 12, color: colors.slate400, marginTop: 6, lineHeight: 17 },
  blocker: {
    marginTop: 8,
    fontSize: 12,
    color: "#b45309",
    backgroundColor: "#fff8ee",
    padding: 8,
    borderRadius: radius.sm,
    lineHeight: 17,
  },
  btn: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.slate200,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.slate50,
  },
  btnOff: { opacity: 0.45 },
  btnText: { fontSize: 13, fontWeight: "700", color: colors.slate600 },
  link: { marginTop: 8, fontSize: 13, fontWeight: "700", color: colors.brandLight },
});
