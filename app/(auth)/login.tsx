import { Link, router } from "expo-router";
import { appAlert } from "@/components/ui/AppAlert";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginWithEmail } from "@/api/auth";
import { apiBaseUrl, getApiErrorMessage } from "@/api/client";
import { AuthShell } from "@/components/AuthShell";
import { RoleContextBanner } from "@/components/auth/AuthSteps";
import { OtpAuthFlow } from "@/components/OtpAuthFlow";
import { AppInput, RoleCard } from "@/components/ui/AppInput";
import { afterAuthHint, authSubtitle, roleDisplayName } from "@/lib/auth-copy";
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
          `This account is a ${roleDisplayName(user.role)}. Opening your ${user.role === "recruiter" ? "hiring" : "job search"} home.`
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
    <AuthShell title="Welcome back" subtitle={authSubtitle("login", role)}>
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
          subtitle="Post jobs & hire"
          selected={role === "recruiter"}
          onPress={() => setRole("recruiter")}
          icon={<Ionicons name="business-outline" size={24} color={colors.brand} />}
        />
      </View>

      <RoleContextBanner
        title={role === "recruiter" ? "Recruiter sign-in" : "Job seeker sign-in"}
        body={afterAuthHint(role, "login")}
      />

      {!showEmailLogin ? (
        <>
          <Text style={styles.methodLabel}>Sign in with OTP (recommended)</Text>
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
                  `This account is a ${roleDisplayName(user.role)}. You can switch account type later in Profile.`
                );
              }
              router.replace(resolvePostAuthPath(user.role, "login") as "/(tabs)");
            }}
          />
        </>
      ) : (
        <View style={styles.emailBox}>
          <Text style={styles.methodLabel}>Sign in with email & password</Text>
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
      )}

      <Pressable
        style={styles.toggleEmail}
        onPress={() => setShowEmailLogin((v) => !v)}
      >
        <Text style={styles.toggleEmailText}>
          {showEmailLogin ? "← Use mobile / email OTP instead" : "Have a password? Sign in with email"}
        </Text>
      </Pressable>

      <View style={styles.legal}>
        <Text style={styles.legalText}>
          By continuing you agree to our{" "}
          <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${apiBaseUrl}/terms`)}>
            Terms
          </Text>
          {" "}and{" "}
          <Text style={styles.legalLink} onPress={() => void Linking.openURL(`${apiBaseUrl}/privacy`)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New here? </Text>
        <Link href={`/(auth)/register?role=${role === "recruiter" ? "recruiter" : "seeker"}` as "/(auth)/register"} asChild>
          <Text style={styles.link}>Create {role === "recruiter" ? "recruiter" : "seeker"} account</Text>
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
  methodLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.slate500,
    marginBottom: 10,
  },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: spacing.sm },
  toggleEmail: { marginTop: spacing.md, alignItems: "center" },
  toggleEmailText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandLight,
    textAlign: "center",
  },
  emailBox: { gap: spacing.sm },
  emailBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandLight,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  emailBtnOff: { opacity: 0.6 },
  emailBtnText: { color: colors.white, fontWeight: "800", fontSize: 15 },
  legal: { marginTop: spacing.lg },
  legalText: {
    textAlign: "center",
    fontSize: 12,
    color: colors.slate500,
    lineHeight: 18,
  },
  legalLink: { color: colors.brandLight, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
    flexWrap: "wrap",
  },
  footerText: { color: colors.slate500, fontSize: 14 },
  link: { color: colors.brandLight, fontWeight: "700", fontSize: 14 },
});
