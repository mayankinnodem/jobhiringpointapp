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
        <Text style={styles.title}>Account type</Text>
        <Text style={styles.body}>Checking if you can switch…</Text>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Account type</Text>
        <Text style={styles.blocker}>{fetchError}</Text>
        <Pressable
          style={styles.btn}
          onPress={() => {
            setLoading(true);
            setFetchError(null);
            void fetchRoleSwitchEligibility()
              .then(setEligibility)
              .catch((e) => setFetchError(getApiErrorMessage(e)))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.btnText}>Retry</Text>
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Wrong account type?</Text>
      <Text style={styles.body}>
        You registered as {roleLabel(eligibility.currentRole)}. Switch to{" "}
        {roleLabel(eligibility.targetRole)} if you chose the wrong option.
      </Text>
      {eligibility.blockers.length > 0 ? (
        <Text style={styles.blocker}>{eligibility.blockers.join("\n")}</Text>
      ) : null}
      <Pressable
        style={[styles.btn, (!eligibility.canSwitch || switching) && styles.btnOff]}
        disabled={!eligibility.canSwitch || switching}
        onPress={confirmSwitch}
      >
        <Text style={styles.btnText}>
          {switching ? "Switching…" : `Switch to ${roleLabel(eligibility.targetRole)}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  title: { fontSize: 15, fontWeight: "800", color: colors.brand },
  body: { fontSize: 13, color: colors.slate500, marginTop: 6, lineHeight: 18 },
  blocker: {
    marginTop: 10,
    fontSize: 12,
    color: "#b45309",
    backgroundColor: "#fff8ee",
    padding: 10,
    borderRadius: radius.md,
    lineHeight: 18,
  },
  btn: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: colors.brandLight,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnOff: { opacity: 0.45 },
  btnText: { fontSize: 13, fontWeight: "700", color: colors.brandLight },
});
