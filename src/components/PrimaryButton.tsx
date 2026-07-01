import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { colors } from "@/theme";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>{loading ? "Please wait…" : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.brandLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  btnDisabled: { opacity: 0.6 },
  text: { color: colors.white, fontSize: 16, fontWeight: "700" } as TextStyle,
});
