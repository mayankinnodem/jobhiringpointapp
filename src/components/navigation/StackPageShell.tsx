import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "@/components/ui/Screen";
import { colors, spacing } from "@/theme";

type StackPageShellProps = {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  /** When false, hide back even if stack can go back (rare). Default: show when router.canGoBack(). */
  showBack?: boolean;
  onBack?: () => void;
};

export function StackPageShell({
  title,
  children,
  headerRight,
  showBack = true,
  onBack,
}: StackPageShellProps) {
  const insets = useSafeAreaInsets();

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.root}>
        <View style={[styles.bar, { paddingTop: insets.top }]}>
          {showBack ? (
            <Pressable
              onPress={handleBack}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color={colors.brand} />
            </Pressable>
          ) : (
            <View style={styles.sideSlot} />
          )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.sideSlot}>{headerRight ?? null}</View>
        </View>
        <Screen edges={["left", "right", "bottom"]} style={styles.body}>
          {children}
        </Screen>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand50 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
    gap: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sideSlot: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.brand,
    textAlign: "center",
  },
  body: { flex: 1 },
});
