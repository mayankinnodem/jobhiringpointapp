import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/theme";

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon = "folder-open-outline",
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={colors.brandLight} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.brand100,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: colors.slate400,
    textAlign: "center",
    lineHeight: 21,
    maxWidth: 280,
  },
  btn: {
    marginTop: 12,
    backgroundColor: colors.brandLight,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  btnText: { color: colors.white, fontWeight: "700", fontSize: 14 },
});
