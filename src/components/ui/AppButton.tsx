import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius } from "@/theme";

export function AppButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  style?: ViewStyle;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        off && styles.off,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? colors.brand : colors.white} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "outline" && styles.textOutline,
            variant === "ghost" && styles.textGhost,
            variant === "secondary" && styles.textSecondary,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 15,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primary: { backgroundColor: colors.brandLight },
  secondary: { backgroundColor: colors.brand },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brandLight,
  },
  ghost: { backgroundColor: "transparent" },
  off: { opacity: 0.55 },
  text: { color: colors.white, fontSize: 16, fontWeight: "700" },
  textOutline: { color: colors.brandLight },
  textGhost: { color: colors.brand, fontWeight: "600" },
  textSecondary: { color: colors.white },
});
