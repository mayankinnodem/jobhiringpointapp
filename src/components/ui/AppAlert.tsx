import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, shadow, spacing } from "@/theme";

export type AppAlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertConfig = {
  title: string;
  message?: string;
  buttons: AppAlertButton[];
};

type AlertContextValue = {
  show: (title: string, message?: string, buttons?: AppAlertButton[]) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

let externalShow: AlertContextValue["show"] | null = null;

/** Drop-in replacement for React Native Alert.alert */
export function appAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[]
) {
  if (externalShow) {
    externalShow(title, message, buttons);
    return;
  }
  console.warn("[appAlert] Provider not mounted:", title, message);
}

function alertTone(title: string, buttons: AppAlertButton[]) {
  const t = title.toLowerCase();
  if (t.includes("error") || t.includes("failed") || t.includes("could not")) {
    return "error" as const;
  }
  if (
    buttons.some((b) => b.style === "destructive") ||
    t.includes("delete") ||
    t.includes("withdraw") ||
    t.includes("sign out")
  ) {
    return "warning" as const;
  }
  if (
    t.includes("saved") ||
    t.includes("success") ||
    t.includes("applied") ||
    t.includes("uploaded") ||
    t.includes("ready") ||
    t.includes("updated") ||
    t.includes("submitted")
  ) {
    return "success" as const;
  }
  return "info" as const;
}

const TONE_META = {
  info: { icon: "information-circle" as const, color: colors.brand, bg: colors.brand50 },
  success: { icon: "checkmark-circle" as const, color: colors.success, bg: colors.successBg },
  warning: { icon: "warning" as const, color: colors.brandLight, bg: "#fff8ee" },
  error: { icon: "close-circle" as const, color: colors.red, bg: colors.redBg },
};

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const show = useCallback(
    (title: string, message?: string, buttons?: AppAlertButton[]) => {
      const resolved =
        buttons && buttons.length > 0
          ? buttons
          : [{ text: "OK", style: "default" as const }];
      setConfig({ title, message, buttons: resolved });
    },
    []
  );

  useEffect(() => {
    externalShow = show;
    return () => {
      externalShow = null;
    };
  }, [show]);

  const dismiss = useCallback(() => setConfig(null), []);

  const onButtonPress = useCallback(
    (button: AppAlertButton) => {
      dismiss();
      requestAnimationFrame(() => button.onPress?.());
    },
    [dismiss]
  );

  const tone = config ? alertTone(config.title, config.buttons) : "info";
  const meta = TONE_META[tone];
  const isActionSheet = (config?.buttons.length ?? 0) > 3;

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      {config ? (
      <Modal
        visible
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        supportedOrientations={["portrait", "landscape"]}
        statusBarTranslucent
        onRequestClose={dismiss}
      >
        <Pressable style={styles.backdrop} onPress={dismiss}>
          <Pressable
            style={[styles.card, isActionSheet && styles.cardWide]}
            onPress={(e) => e.stopPropagation()}
          >
            {config ? (
              <>
                <View style={styles.header}>
                  <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={28} color={meta.color} />
                  </View>
                  <Text style={styles.title}>{config.title}</Text>
                  {config.message ? (
                    <Text style={styles.message}>{config.message}</Text>
                  ) : null}
                </View>

                {isActionSheet ? (
                  <ScrollView
                    style={styles.optionScroll}
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {config.buttons.map((btn, i) => (
                      <Pressable
                        key={`${btn.text}-${i}`}
                        style={[
                          styles.optionRow,
                          i < config.buttons.length - 1 && styles.optionBorder,
                        ]}
                        onPress={() => onButtonPress(btn)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            btn.style === "destructive" && styles.destructiveText,
                            btn.style === "cancel" && styles.cancelText,
                          ]}
                        >
                          {btn.text}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View
                    style={[
                      styles.actions,
                      config.buttons.length > 2 && styles.actionsColumn,
                    ]}
                  >
                    {config.buttons.map((btn, i) => {
                      const isCancel = btn.style === "cancel";
                      const isDestructive = btn.style === "destructive";
                      const isPrimary =
                        !isCancel &&
                        !isDestructive &&
                        (config.buttons.length === 1 ||
                          i === config.buttons.length - 1);

                      return (
                        <Pressable
                          key={`${btn.text}-${i}`}
                          style={[
                            styles.actionBtn,
                            config.buttons.length <= 2 && styles.actionBtnRow,
                            isPrimary && styles.actionPrimary,
                            isCancel && styles.actionCancel,
                            isDestructive && styles.actionDestructive,
                          ]}
                          onPress={() => onButtonPress(btn)}
                        >
                          <Text
                            style={[
                              styles.actionText,
                              isPrimary && styles.actionTextPrimary,
                              isCancel && styles.actionTextCancel,
                              isDestructive && styles.actionTextDestructive,
                            ]}
                          >
                            {btn.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
      ) : null}
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAppAlert must be used within AppAlertProvider");
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadow.float,
  },
  cardWide: { maxWidth: 360 },
  header: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand,
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
  },
  actionsColumn: { flexDirection: "column" },
  actionBtn: {
    paddingVertical: 13,
    borderRadius: radius.md,
    alignItems: "center",
    backgroundColor: colors.brand50,
  },
  actionBtnRow: { flex: 1 },
  actionPrimary: { backgroundColor: colors.brandLight },
  actionCancel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.brand100 },
  actionDestructive: { backgroundColor: colors.redBg, borderWidth: 1, borderColor: "#fecaca" },
  actionText: { fontSize: 15, fontWeight: "700", color: colors.brand },
  actionTextPrimary: { color: colors.white },
  actionTextCancel: { color: colors.slate500 },
  actionTextDestructive: { color: colors.red },
  optionScroll: { maxHeight: 320, borderTopWidth: 1, borderTopColor: colors.brand100 },
  optionRow: { paddingVertical: 14, paddingHorizontal: spacing.lg },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: colors.brand100 },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand,
    textTransform: "capitalize",
    textAlign: "center",
  },
  destructiveText: { color: colors.red, fontWeight: "700" },
  cancelText: { color: colors.slate500 },
});
