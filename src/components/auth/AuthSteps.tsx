import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

export function AuthStepBar({
  steps,
  activeIndex,
}: {
  steps: string[];
  activeIndex: number;
}) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      {steps.map((label, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, (done || active) && styles.dotOn, active && styles.dotActive]}>
              <Text style={[styles.dotText, (done || active) && styles.dotTextOn]}>
                {done ? "✓" : i + 1}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelOn]} numberOfLines={1}>
              {label}
            </Text>
            {i < steps.length - 1 ? <View style={[styles.line, done && styles.lineOn]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export function RoleContextBanner({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerTitle}>{title}</Text>
      <Text style={styles.bannerBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: 0,
  },
  item: { flex: 1, alignItems: "center", position: "relative" },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand100,
    zIndex: 1,
  },
  dotOn: { backgroundColor: colors.brand50, borderColor: colors.brandLight },
  dotActive: { backgroundColor: colors.brandLight, borderColor: colors.brandLight },
  dotText: { fontSize: 11, fontWeight: "800", color: colors.slate400 },
  dotTextOn: { color: colors.brand },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: colors.slate400,
    textAlign: "center",
  },
  labelOn: { color: colors.brand, fontWeight: "800" },
  line: {
    position: "absolute",
    top: 13,
    left: "55%",
    right: "-45%",
    height: 2,
    backgroundColor: colors.brand100,
    zIndex: 0,
  },
  lineOn: { backgroundColor: colors.brandLight },
  banner: {
    backgroundColor: colors.brand50,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  bannerTitle: { fontSize: 13, fontWeight: "800", color: colors.brand },
  bannerBody: { fontSize: 12, color: colors.slate600, marginTop: 4, lineHeight: 17 },
});
