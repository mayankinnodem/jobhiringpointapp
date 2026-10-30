import { Ionicons } from "@expo/vector-icons";
import { appAlert } from "@/components/ui/AppAlert";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchSeekerProfile } from "@/api/profile";
import { apiBaseUrl } from "@/api/client";
import { AppButton } from "@/components/ui/AppButton";
import { SwitchRoleCard } from "@/components/SwitchRoleCard";
import { Screen } from "@/components/ui/Screen";
import { useAuthStore } from "@/store/authStore";
import { brandGradient, colors, radius, shadow, spacing } from "@/theme";

function topSafePad(insetsTop: number) {
  if (insetsTop > 0) return insetsTop;
  // Fallback when metrics briefly report 0 (Dynamic Island / notch)
  return Platform.OS === "ios" ? 54 : 28;
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const insets = useSafeAreaInsets();
  const [profilePercent, setProfilePercent] = useState<number | null>(null);
  const padTop = topSafePad(insets.top);

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
    appAlert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void onLogout() },
    ]);
  }

  function openSite(path: string) {
    void Linking.openURL(`${apiBaseUrl}${path}`);
  }

  function confirmDeleteAccount() {
    appAlert(
      "Delete account",
      "This opens the official deletion page. After we verify the request, your profile, resume, and messages are removed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue", style: "destructive", onPress: () => openSite("/delete-account") },
      ]
    );
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={[...brandGradient]}
          style={[styles.hero, { paddingTop: padTop + spacing.md }]}
        >
          <View style={styles.heroRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.phone} numberOfLines={1}>
                {user.phone ?? user.email}
              </Text>
              <View style={styles.badges}>
                <View style={styles.roleBadge}>
                  <Ionicons
                    name={user.role === "recruiter" ? "business" : "person"}
                    size={13}
                    color={colors.brandLight}
                  />
                  <Text style={styles.roleText}>{roleLabel}</Text>
                </View>
                {profilePercent != null ? (
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{profilePercent}% complete</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
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
          <Text style={styles.menuHeading}>
            {user.role === "recruiter" ? "Hiring tools" : "Career tools"}
          </Text>
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            sub="Application & chat updates"
            onPress={() => router.push("/notifications")}
          />

          {user.role === "job_seeker" ? (
            <>
              <MenuRow
                icon="create-outline"
                label="My job seeker profile"
                sub="Headline, skills, location, resume"
                onPress={() => router.push("/complete-profile")}
              />
              <MenuRow
                icon="sparkles-outline"
                label="Recommended jobs"
                sub="Matched to your skills"
                onPress={() => router.push("/recommended")}
              />
              <MenuRow
                icon="alarm-outline"
                label="Job alerts"
                sub="Get notified for new matches"
                onPress={() => router.push("/job-alerts")}
              />
              <MenuRow
                icon="business-outline"
                label="Browse companies"
                sub="Explore hiring companies"
                onPress={() => router.push("/companies")}
              />
              <MenuRow
                icon="bookmark-outline"
                label="Saved jobs"
                sub="Bookmarked listings"
                onPress={() => router.push("/(tabs)/saved")}
              />
              <MenuRow
                icon="document-text-outline"
                label="My applications"
                sub="Track application status"
                onPress={() => router.push("/(tabs)/applications")}
              />
            </>
          ) : null}

          {user.role === "recruiter" ? (
            <>
              <MenuRow
                icon="business-outline"
                label="Company profile"
                sub="Name, website, industry — shown on jobs"
                onPress={() => router.push("/recruiter/company")}
              />
              <MenuRow
                icon="add-circle-outline"
                label="Post a job"
                sub="Create a new job listing"
                onPress={() => router.push("/recruiter/post-job")}
              />
              <MenuRow
                icon="stats-chart-outline"
                label="Hiring dashboard"
                sub="Jobs & applicants overview"
                onPress={() => router.push("/(tabs)/applications")}
              />
            </>
          ) : null}
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.menuHeading}>Account settings</Text>
          <SwitchRoleCard />
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.menuHeading}>Support & legal</Text>
          <MenuRow
            icon="help-circle-outline"
            label="Help"
            sub="FAQs and support"
            onPress={() => openSite("/help")}
          />
          <MenuRow
            icon="flag-outline"
            label="Community guidelines"
            sub="Rules for jobs and messages"
            onPress={() => openSite("/community-guidelines")}
          />
          <MenuRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => openSite("/terms")}
          />
          <MenuRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => openSite("/privacy")}
          />
          <MenuRow
            icon="trash-outline"
            label="Delete account"
            sub="Request removal of your data"
            onPress={confirmDeleteAccount}
          />
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
  scroll: { paddingBottom: 8 },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: colors.white },
  heroMeta: { flex: 1, minWidth: 0 },
  name: { fontSize: 20, fontWeight: "800", color: colors.white, letterSpacing: -0.3 },
  phone: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  roleText: { color: colors.white, fontWeight: "700", fontSize: 11 },
  percentBadge: {
    backgroundColor: "rgba(255,140,0,0.28)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  percentText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  planCard: {
    marginHorizontal: spacing.md,
    marginTop: -18,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.float,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planLabel: { fontSize: 14, fontWeight: "600", color: colors.slate500 },
  planPill: {
    backgroundColor: colors.brand50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
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
  accountSection: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
  logoutWrap: { padding: spacing.lg, paddingBottom: 40 },
});
