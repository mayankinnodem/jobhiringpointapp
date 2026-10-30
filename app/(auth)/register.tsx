import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiBaseUrl } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { RoleContextBanner } from "@/components/auth/AuthSteps";
import { OtpAuthFlow } from "@/components/OtpAuthFlow";
import { AppInput, RoleCard } from "@/components/ui/AppInput";
import { afterAuthHint, authSubtitle } from "@/lib/auth-copy";
import { resolvePostAuthPath } from "@/lib/auth-redirect";
import { colors, spacing } from "@/theme";
import type { PublicUser } from "@/types";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [name, setName] = useState("");
  const [role, setRole] = useState<"job_seeker" | "recruiter">(
    params.role === "recruiter" ? "recruiter" : "job_seeker"
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (params.role === "recruiter") setRole("recruiter");
    if (params.role === "seeker" || params.role === "job_seeker") setRole("job_seeker");
  }, [params.role]);

  function onSuccess(user: PublicUser) {
    router.replace(resolvePostAuthPath(user.role, "register") as "/complete-profile");
  }

  const canContinue = acceptedTerms && name.trim().length >= 2;

  return (
    <AuthShell showBack title="Create your account" subtitle={authSubtitle("register", role)}>
      <Text style={styles.sectionLabel}>I want to</Text>
      <View style={styles.roleRow}>
        <RoleCard
          title="Find a job"
          subtitle="Job seeker profile"
          selected={role === "job_seeker"}
          onPress={() => setRole("job_seeker")}
          icon={<Ionicons name="search-outline" size={24} color={colors.brand} />}
        />
        <RoleCard
          title="Hire talent"
          subtitle="Recruiter / company"
          selected={role === "recruiter"}
          onPress={() => setRole("recruiter")}
          icon={<Ionicons name="people-outline" size={24} color={colors.brand} />}
        />
      </View>

      <RoleContextBanner
        title={role === "recruiter" ? "Recruiter registration" : "Job seeker registration"}
        body={afterAuthHint(role, "register")}
      />

      <AppInput
        label="Full name"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        placeholder={role === "recruiter" ? "Your name (hiring contact)" : "As on your resume"}
      />

      <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)}>
        <Ionicons
          name={acceptedTerms ? "checkbox" : "square-outline"}
          size={22}
          color={acceptedTerms ? colors.brandLight : colors.slate400}
        />
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text
            style={styles.termsLink}
            onPress={() => void Linking.openURL(`${apiBaseUrl}/terms`)}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            style={styles.termsLink}
            onPress={() => void Linking.openURL(`${apiBaseUrl}/privacy`)}
          >
            Privacy Policy
          </Text>
        </Text>
      </Pressable>

      {canContinue ? (
        <OtpAuthFlow
          purpose="register"
          role={role}
          name={name.trim()}
          acceptedTerms={acceptedTerms}
          onSuccess={onSuccess}
        />
      ) : (
        <Text style={styles.hint}>
          {!acceptedTerms
            ? "Accept terms above to continue"
            : "Enter your full name (at least 2 characters)"}
        </Text>
      )}

      <Text style={styles.note}>
        {role === "job_seeker"
          ? "Free forever for job seekers — never pay to apply."
          : "Free plan includes a limited number of job posts."}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already registered? </Text>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Sign in</Text>
        </Link>
      </View>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.slate500,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: spacing.sm },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: spacing.md,
  },
  termsText: { flex: 1, fontSize: 12, color: colors.slate600, lineHeight: 18 },
  termsLink: { color: colors.brandLight, fontWeight: "700" },
  hint: { fontSize: 13, color: colors.slate400, textAlign: "center", marginTop: spacing.sm },
  note: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.slate500,
    textAlign: "center",
    lineHeight: 17,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
    flexWrap: "wrap",
  },
  footerText: { color: colors.slate500, fontSize: 14 },
  link: { color: colors.brandLight, fontWeight: "700", fontSize: 14 },
});
