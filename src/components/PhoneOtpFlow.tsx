import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { sendOtp } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import { useAuthStore } from "@/store/authStore";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { colors, radius, spacing } from "@/theme";
import type { PublicUser, UserRole } from "@/types";

type Props = {
  purpose: "register" | "login";
  role: UserRole;
  name?: string;
  onSuccess: (user: PublicUser) => void;
  onRoleMismatch?: (role: UserRole) => void;
};

export function PhoneOtpFlow({ purpose, role, name, onSuccess, onRoleMismatch }: Props) {
  const verifyOtpAuth = useAuthStore((s) => s.verifyOtpAuth);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function onSendOtp() {
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendOtp({
        phone,
        purpose,
        name: purpose === "register" ? name : undefined,
        role: purpose === "register" ? (role as "job_seeker" | "recruiter") : undefined,
      });
      setStep("otp");
      setCountdown(60);
      setOtp("");
    } catch (e) {
      const msg = getApiErrorMessage(e);
      if (purpose === "login" && msg.includes("register")) {
        setError(`${msg} Use "Create free account" below.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await verifyOtpAuth({
        phone,
        otp,
        purpose,
        expectedRole: purpose === "login" ? role : undefined,
      });
      onSuccess(user);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; actualRole?: UserRole } } };
      const actualRole = err.response?.data?.actualRole;
      if (actualRole && onRoleMismatch) onRoleMismatch(actualRole);
      setError(err.response?.data?.error ?? getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    const display = phone.replace(/\D/g, "").slice(-10);
    return (
      <View>
        <View style={styles.otpBanner}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.brandLight} />
          <Text style={styles.hint}>
            OTP sent to{" "}
            <Text style={styles.bold}>+91 {display.slice(0, 5)} {display.slice(5)}</Text>
          </Text>
        </View>
        <AppInput
          label="6-digit OTP"
          icon="keypad-outline"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          inputStyle={{ letterSpacing: 6, fontSize: 20, fontWeight: "700", textAlign: "center" }}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          label={purpose === "register" ? "Verify & create account" : "Verify & sign in"}
          onPress={() => void onVerify()}
          loading={loading}
          disabled={otp.length !== 6}
        />
        <View style={styles.row}>
          <Pressable onPress={() => { setStep("phone"); setOtp(""); setError(null); }}>
            <Text style={styles.linkMuted}>← Change number</Text>
          </Pressable>
          <Pressable disabled={countdown > 0 || loading} onPress={() => void onSendOtp()}>
            <Text style={[styles.link, countdown > 0 && styles.linkOff]}>
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.phoneRow}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+91</Text>
        </View>
        <View style={styles.phoneInput}>
          <AppInput
            label="Mobile number"
            icon="call-outline"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton
        label="Send OTP"
        onPress={() => void onSendOtp()}
        loading={loading}
        disabled={phone.length !== 10}
      />
      <View style={styles.secure}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
        <Text style={styles.secureText}>Secure OTP verification via SMS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phoneRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  prefix: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.brand50,
    borderWidth: 1,
    borderColor: colors.brand100,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  prefixText: { fontWeight: "700", color: colors.brand },
  phoneInput: { flex: 1 },
  otpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand50,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brand100,
  },
  hint: { fontSize: 13, color: colors.slate600, flex: 1, lineHeight: 18 },
  bold: { fontWeight: "700", color: colors.brand },
  error: { color: colors.red, fontSize: 13, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  link: { color: colors.brandLight, fontWeight: "700", fontSize: 13 },
  linkMuted: { color: colors.slate400, fontWeight: "600", fontSize: 13 },
  linkOff: { color: colors.slate400 },
  secure: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  secureText: { fontSize: 12, color: colors.slate500 },
});
