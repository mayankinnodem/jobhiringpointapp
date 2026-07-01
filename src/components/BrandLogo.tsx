import { Image, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "@/theme";

const ASPECT = {
  default: 520 / 105,
  inverse: 520 / 187,
} as const;

export type BrandLogoSize = "sm" | "md" | "lg";
export type BrandLogoVariant = "default" | "inverse";

const WIDTHS: Record<BrandLogoSize, number> = {
  sm: 130,
  md: 200,
  lg: 220,
};

type BrandLogoProps = {
  size?: BrandLogoSize;
  /** `default` on white/light UI · `inverse` (footer logo) on navy headers */
  variant?: BrandLogoVariant;
  tagline?: boolean;
  style?: ViewStyle;
};

export function BrandLogo({
  size = "md",
  variant = "default",
  tagline = false,
  style,
}: BrandLogoProps) {
  const width = WIDTHS[size];
  const height = width / ASPECT[variant];
  const source =
    variant === "inverse"
      ? require("../../assets/footer-logo.png")
      : require("../../assets/logo.png");

  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel="Job Hiring Point"
      />
      {tagline && variant === "default" ? (
        <Text style={styles.tagline}>Trusted Hiring. Trusted Careers.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: colors.slate500,
    letterSpacing: 0.2,
  },
});
