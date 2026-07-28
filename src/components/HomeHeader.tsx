import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { HeaderBrand } from "@/components/HeaderBrand";
import { colors, brandGradient, radius, spacing } from "@/theme";
import type { PublicUser } from "@/types";

export function HomeHeader({
  user,
  unread,
  searchSlot,
}: {
  user: PublicUser | null;
  unread: number;
  searchSlot?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const first = user?.name?.split(" ")[0] ?? "there";

  return (
    <LinearGradient
      colors={[...brandGradient]}
      style={[styles.grad, { paddingTop: insets.top + spacing.sm }]}
    >
      <View style={styles.topRow}>
        <HeaderBrand />
        <Pressable style={styles.bell} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={22} color={colors.white} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <Text style={styles.greet}>Hello, {first} 👋</Text>
      <Text style={styles.tagline}>Find your next opportunity</Text>

      <View style={styles.stats}>
        <StatPill icon="briefcase-outline" label="Live jobs" />
        <StatPill icon="shield-checkmark-outline" label="Verified" />
        <StatPill icon="flash-outline" label="Quick apply" />
      </View>

      {searchSlot ? <View style={styles.searchSlot}>{searchSlot}</View> : null}
    </LinearGradient>
  );
}

function StatPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={13} color={colors.brandLight} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grad: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  greet: { fontSize: 24, fontWeight: "800", color: colors.white, letterSpacing: -0.4 },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 4 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: colors.white },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.md },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillText: { fontSize: 11, color: "rgba(255,255,255,0.92)", fontWeight: "600" },
  searchSlot: { marginTop: spacing.md },
});
