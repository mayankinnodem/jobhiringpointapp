import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "@/components/BrandLogo";
import { colors, radius, shadow, spacing } from "@/theme";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BrandLogo size="lg" />
            <View style={styles.accent} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formCard}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  header: {
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
  },
  accent: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandLight,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.brand,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate500,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 300,
  },
  form: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.slate50,
    flex: 1,
    minHeight: 400,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brand100,
    ...shadow.card,
  },
});
