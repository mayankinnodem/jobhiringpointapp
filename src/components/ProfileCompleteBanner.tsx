import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MIN_APPLY_PERCENT } from "@/constants/profile";
import { colors, radius, spacing } from "@/theme";

export function ProfileCompleteBanner({
  percent,
  missing,
}: {
  percent: number;
  missing: string[];
}) {
  if (percent >= MIN_APPLY_PERCENT) return null;

  return (
    <Pressable style={styles.wrap} onPress={() => router.push("/complete-profile")}>
      <View style={styles.icon}>
        <Ionicons name="person-circle-outline" size={22} color={colors.brand} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Complete your profile ({percent}%)</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {missing[0] ?? "Required before you apply to jobs"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.brandLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffddb3",
    borderLeftWidth: 4,
    borderLeftColor: colors.brandLight,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: "700", color: colors.brand },
  sub: { fontSize: 12, color: colors.slate500, marginTop: 2 },
});
