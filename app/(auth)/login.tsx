import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthShell } from "@/components/AuthShell";
import { PhoneOtpFlow } from "@/components/PhoneOtpFlow";
import { RoleCard } from "@/components/ui/AppInput";
import { colors, spacing } from "@/theme";

export default function LoginScreen() {
  const [role, setRole] = useState<"job_seeker" | "recruiter">("job_seeker");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your mobile number — OTP sent via SMS"
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

      <PhoneOtpFlow
        purpose="login"
        role={role}
        onRoleMismatch={(actual) => {
          Alert.alert(
            "Wrong role",
            `This number is registered as ${actual === "recruiter" ? "Recruiter" : "Job Seeker"}`
          );
          setRole(actual as "job_seeker" | "recruiter");
        }}
        onSuccess={() => router.replace("/(tabs)")}
      />

      <Text style={styles.hint}>
        New user? Register first. Dev login: 9999999999 + OTP 999999 (run npm run seed in web).
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/(auth)/register" asChild>
          <Text style={styles.link}>Register with mobile</Text>
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
