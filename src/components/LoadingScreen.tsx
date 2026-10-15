import { Image, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <Image
        // Use splash-icon (always present) — flat shield on white, no card chrome
        source={require("../../assets/splash-icon.png")}
        style={styles.mark}
        resizeMode="contain"
        accessibilityLabel="Job Hiring Point"
      />
      <Text style={styles.title}>Job Hiring Point</Text>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
  },
  /** Large flat mark — no View shadow / no floating card */
  mark: {
    width: 280,
    height: 280,
  },
  title: {
    marginTop: spacing.md,
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand,
    letterSpacing: -0.3,
  },
  text: {
    marginTop: spacing.sm,
    color: colors.slate500,
    fontSize: 14,
    fontWeight: "600",
  },
});
