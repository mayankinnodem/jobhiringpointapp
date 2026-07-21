import { Link, router } from "expo-router";
import { appAlert } from "@/components/ui/AppAlert";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginWithEmail } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { OtpAuthFlow } from "@/components/OtpAuthFlow";
import { AppInput, RoleCard } from "@/components/ui/AppInput";
import { resolvePostAuthPath } from "@/lib/auth-redirect";
import { colors, radius, spacing } from "@/theme";
import type { PublicUser } from "@/types";

export default function LoginScreen() {
  const [role, setRole] = useState<"job_seeker" | "recruiter">("job_seeker");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  async function onEmailLogin() {
    if (!email.trim() || !password) {
      appAlert("Missing fields", "Enter email and password.");
      return;
    }
    setEmailBusy(true);
    try {
      const user = await loginWithEmail(email, password);
      if (user.role !== role && user.role !== "admin") {
        appAlert(
          "Signed in",
          `This account is registered as ${user.role === "recruiter" ? "Recruiter" : "Job Seeker"}.`
        );
      }
      router.replace(resolvePostAuthPath(user.role, "login") as "/(tabs)");
    } catch (e) {
      appAlert("Could not sign in", getApiErrorMessage(e));
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        showEmailLogin
          ? "Sign in with email and password"
          : "Sign in with email or mobile OTP"
      }
    >
      <Text style={styles.sectionLabel}>I am a</Text>
      <View style={styles.roleRow}>
        <RoleCard
          title="Job Seeker"
          subtitle="Find & apply to jobs"
          selected={role === "job_seeker"}
          onPress={() => setRole("job_seeker")}
          icon={<Ionicons name="person-outline" size={24} color={colors.brand} />}
        />
        <RoleCard
          title="Recruiter"
          subtitle="Hire top talent"
          selected={role === "recruiter"}
          onPress={() => setRole("recruiter")}
          icon={<Ionicons name="business-outline" size={24} color={colors.brand} />}
        />
      </View>

      <OtpAuthFlow
        purpose="login"
        role={role}
        onRoleMismatch={(actual) => {
          setRole(actual as "job_seeker" | "recruiter");
        }}
        onSuccess={(user: PublicUser) => {
          if (user.role !== role) {
            appAlert(
              "Signed in",
              `This account is registered as ${user.role === "recruiter" ? "Recruiter" : "Job Seeker"}. You can switch account type in Profile.`
            );
          }
          router.replace(resolvePostAuthPath(user.role, "login") as "/(tabs)");
        }}
      />

      <Pressable
        style={styles.toggleEmail}
        onPress={() => setShowEmailLogin((v) => !v)}
      >
        <Text style={styles.toggleEmailText}>
          {showEmailLogin ? "Use mobile OTP instead" : "Sign in with email instead"}
        </Text>
      </Pressable>

      {showEmailLogin ? (
        <View style={styles.emailBox}>
          <AppInput
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <Pressable
            style={[styles.emailBtn, emailBusy && styles.emailBtnOff]}
            disabled={emailBusy}
            onPress={() => void onEmailLogin()}
          >
            {emailBusy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.emailBtnText}>Sign in with email</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {__DEV__ ? (
        <Text style={styles.hint}>
          Dev login: 9999999999 + OTP 999999 (run npm run seed in web).
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/(auth)/register" asChild>
          <Text style={styles.link}>Create free account</Text>
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
  roleRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  toggleEmail: { marginTop: spacing.md, alignItems: "center" },
  toggleEmailText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandLight,
  },
  emailBox: { marginTop: spacing.md, gap: spacing.sm },
  emailBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandLight,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  emailBtnOff: { opacity: 0.6 },
  emailBtnText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: colors.slate400,
    marginTop: spacing.md,
    lineHeight: 18,
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
