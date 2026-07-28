import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleSheet, Text, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, brandGradient, spacing } from "@/theme";

type TabGradientHeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  style?: ViewStyle;
};

/** Navy gradient header for tab screens — respects notch / status bar. */
export function TabGradientHeader({ title, subtitle, children, style }: TabGradientHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[...brandGradient]}
      style={[styles.grad, { paddingTop: insets.top + spacing.sm }, style]}
    >
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  grad: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: { fontSize: 24, fontWeight: "800", color: colors.white },
  sub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
});
