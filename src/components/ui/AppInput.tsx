import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors, radius } from "@/theme";

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  inputStyle?: TextInputProps["style"];
};

export function AppInput({ label, icon, error, secureTextEntry, inputStyle, style, ...props }: Props) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {icon ? (
          <Ionicons name={icon} size={20} color={colors.slate400} style={styles.icon} />
        ) : null}
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={colors.slate400}
          style={[styles.input, inputStyle]}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.slate400}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function RoleCard({
  title,
  subtitle,
  icon,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleCard, selected && styles.roleCardOn]}
    >
      <View style={[styles.roleIcon, selected && styles.roleIconOn]}>{icon}</View>
      <Text style={[styles.roleTitle, selected && styles.roleTitleOn]}>{title}</Text>
      <Text style={styles.roleSub}>{subtitle}</Text>
      {selected ? (
        <View style={styles.check}>
          <Ionicons name="checkmark-circle" size={22} color={colors.brandLight} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.brand, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand100,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  fieldError: { borderColor: colors.red },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: colors.slate900, paddingVertical: 12 },
  error: { fontSize: 12, color: colors.red, marginTop: 4 },
  roleCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.brand100,
    position: "relative",
  },
  roleCardOn: { borderColor: colors.brandLight, backgroundColor: "#fffaf3" },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  roleIconOn: { backgroundColor: "#ffedd5" },
  roleTitle: { fontSize: 15, fontWeight: "700", color: colors.brand },
  roleTitleOn: { color: colors.brandDark },
  roleSub: { fontSize: 11, color: colors.slate400, marginTop: 2, lineHeight: 15 },
  check: { position: "absolute", top: 10, right: 10 },
});
