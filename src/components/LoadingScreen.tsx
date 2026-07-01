import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "@/components/BrandLogo";
import { colors, spacing } from "@/theme";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <BrandLogo size="lg" tagline />
      <ActivityIndicator size="large" color={colors.brandLight} style={styles.spinner} />
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
  spinner: { marginTop: spacing.xl },
  text: {
    marginTop: spacing.md,
    color: colors.slate500,
    fontSize: 14,
    fontWeight: "600",
  },
});
