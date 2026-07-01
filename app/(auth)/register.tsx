import { Link, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthShell } from "@/components/AuthShell";
import { PhoneOtpFlow } from "@/components/PhoneOtpFlow";
import { AppInput, RoleCard } from "@/components/ui/AppInput";
import { colors, spacing } from "@/theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<"job_seeker" | "recruiter">("job_seeker");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register with mobile OTP — no email or password required"
    >
      <Text style={styles.sectionLabel}>Register as</Text>
      <View style={styles.roleRow}>
        <RoleCard
          title="Job Seeker"
          subtitle="Apply to jobs"
          selected={role === "job_seeker"}
          onPress={() => setRole("job_seeker")}
          icon={<Ionicons name="search-outline" size={24} color={colors.brand} />}
        />
        <RoleCard
          title="Recruiter"
          subtitle="Post jobs & hire"
          selected={role === "recruiter"}
          onPress={() => setRole("recruiter")}
          icon={<Ionicons name="people-outline" size={24} color={colors.brand} />}
        />
      </View>

      <AppInput
        label="Full name"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        placeholder="Your full name"
      />

      {name.trim() ? (
        <PhoneOtpFlow
          purpose="register"
          role={role}
          name={name.trim()}
          onSuccess={() => router.replace("/(tabs)")}
        />
      ) : (
        <Text style={styles.hint}>Enter your name above to continue</Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already registered? </Text>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Sign in with mobile</Text>
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
  hint: { fontSize: 13, color: colors.slate400, textAlign: "center", marginTop: spacing.sm },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
    flexWrap: "wrap",
  },
  footerText: { color: colors.slate500, fontSize: 14 },
  link: { color: colors.brandLight, fontWeight: "700", fontSize: 14 },
});
