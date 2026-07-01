import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchSeekerProfile } from "@/api/profile";
import { AppButton } from "@/components/ui/AppButton";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { colors, radius, shadow, spacing } from "@/theme";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [profilePercent, setProfilePercent] = useState<number | null>(null);

  useEffect(() => {
    if (user?.role === "job_seeker") {
      void fetchSeekerProfile()
        .then((d) => setProfilePercent(d.canApply.percent))
        .catch(() => {});
    }
  }, [user?.role]);

  if (!user) return null;

  const roleLabel =
    user.role === "job_seeker" ? "Job Seeker" : user.role === "recruiter" ? "Recruiter" : "Admin";

  async function onLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  function confirmLogout() {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void onLogout() },
    ]);
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>{user.phone ?? user.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons
              name={user.role === "recruiter" ? "business" : "person"}
              size={14}
              color={colors.brandLight}
            />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
          {profilePercent != null ? (
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>Profile {profilePercent}% complete</Text>
            </View>
          ) : null}
        </LinearGradient>

        <View style={styles.planCard}>
          <View style={styles.planRow}>
            <Text style={styles.planLabel}>Subscription</Text>
            <View style={styles.planPill}>
              <Text style={styles.planValue}>{user.subscriptionPlan}</Text>
            </View>
          </View>
          {user.subscriptionExpiresAt ? (
            <Text style={styles.planExpiry}>
              Expires {new Date(user.subscriptionExpiresAt).toLocaleDateString("en-IN")}
            </Text>
          ) : null}
        </View>

        <View style={styles.menu}>
          <Text style={styles.menuHeading}>Quick actions</Text>
          <MenuRow icon="notifications-outline" label="Notifications" sub="Application updates" onPress={() => router.push("/notifications")} />

          {user.role === "job_seeker" ? (
            <>
              <MenuRow icon="create-outline" label="Edit profile" sub="Headline, skills, resume" onPress={() => router.push("/complete-profile")} />
              <MenuRow icon="sparkles-outline" label="Recommended jobs" sub="Matched to your skills" onPress={() => router.push("/recommended")} />
              <MenuRow icon="alarm-outline" label="Job alerts" sub="Get notified for new matches" onPress={() => router.push("/job-alerts")} />
              <MenuRow icon="business-outline" label="Browse companies" sub="Explore hiring companies" onPress={() => router.push("/companies")} />
              <MenuRow icon="bookmark-outline" label="Saved jobs" sub="Bookmarked listings" onPress={() => router.push("/(tabs)/saved")} />
              <MenuRow icon="document-text-outline" label="My applications" sub="Track application status" onPress={() => router.push("/(tabs)/applications")} />
            </>
          ) : null}

          {user.role === "recruiter" ? (
            <>
              <MenuRow icon="stats-chart-outline" label="Dashboard" sub="Jobs & applications overview" onPress={() => router.push("/(tabs)/applications")} />
              <MenuRow icon="add-circle-outline" label="Post a job" sub="Create new job listing" onPress={() => router.push("/recruiter/post-job")} />
              <MenuRow icon="business-outline" label="Company profile" sub="Your company details" onPress={() => router.push("/recruiter/company")} />
            </>
          ) : null}
        </View>

        <View style={styles.logoutWrap}>
          <AppButton label="Sign out" onPress={confirmLogout} variant="outline" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={22} color={colors.brand} />
      </View>
      <View style={styles.menuBody}>
        <Text style={styles.menuLabel}>{label}</Text>
        {sub ? <Text style={styles.menuSub}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.slate400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: "800", color: colors.white },
  name: { fontSize: 22, fontWeight: "800", color: colors.white },
  phone: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  roleText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  percentBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255,140,0,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  percentText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  planCard: {
    marginHorizontal: spacing.md,
    marginTop: -20,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.float,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planLabel: { fontSize: 14, fontWeight: "600", color: colors.slate500 },
  planPill: { backgroundColor: colors.brand50, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  planValue: { fontSize: 13, fontWeight: "700", color: colors.brand, textTransform: "capitalize" },
  planExpiry: { fontSize: 12, color: colors.slate400, marginTop: 8 },
  menu: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  menuHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.slate400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.brand100,
    gap: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  menuBody: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700", color: colors.brand },
  menuSub: { fontSize: 12, color: colors.slate400, marginTop: 2, lineHeight: 16 },
  logoutWrap: { padding: spacing.lg, paddingBottom: 40 },
});
