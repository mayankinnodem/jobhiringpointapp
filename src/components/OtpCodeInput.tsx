import { useRef } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { OTP_LENGTH, normalizeOtpInput } from "@/constants/otp";
import { colors, radius, spacing } from "@/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpCodeInput({ value, onChange, disabled }: Props) {
  const clean = normalizeOtpInput(value);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => clean[i] ?? "");
  const refs = useRef<(TextInput | null)[]>([]);

  function commit(next: string) {
    onChange(normalizeOtpInput(next));
  }

  function updateAt(index: number, char: string) {
    const arr = [...digits];
    arr[index] = char;
    commit(arr.join(""));
    if (char && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function onChangeDigit(index: number, text: string) {
    const cleaned = text.replace(/\D/g, "");
    if (!cleaned) {
      updateAt(index, "");
      return;
    }
    if (cleaned.length > 1) {
      commit(cleaned);
      const len = Math.min(cleaned.length, OTP_LENGTH);
      refs.current[len - 1]?.focus();
      return;
    }
    updateAt(index, cleaned);
  }

  function onKeyPress(index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key !== "Backspace") return;
    if (digits[index]) return;
    if (index > 0) {
      updateAt(index - 1, "");
      refs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{OTP_LENGTH}-digit OTP</Text>
      <View style={styles.row}>
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            style={[styles.box, digits[index]?.trim() ? styles.boxFilled : null]}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            value={digits[index]}
            onChangeText={(t) => onChangeDigit(index, t)}
            onKeyPress={(e) => onKeyPress(index, e)}
            selectTextOnFocus
            editable={!disabled}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
          />
        ))}
      </View>
      <Text style={styles.hint}>Enter the {OTP_LENGTH}-digit code from SMS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  label: { fontSize: 13, fontWeight: "600", color: colors.brand, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  box: {
    flex: 1,
    maxWidth: 48,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.brand100,
    backgroundColor: colors.white,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand,
  },
  boxFilled: { borderColor: colors.brandLight, backgroundColor: colors.brand50 },
  hint: { fontSize: 12, color: colors.slate400, marginTop: 10, textAlign: "center" },
});
