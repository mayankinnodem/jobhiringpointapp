import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  fetchRegistrationSettings,
  sendLoginOtp,
  sendRegisterOtp,
  verifyOtpSilent,
} from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import {
  isCompleteOtp,
  otpValidationMessage,
} from "@/constants/otp";
import { isValidWebsiteInput } from "@/lib/website";
import { useAuthStore } from "@/store/authStore";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { OtpCodeInput } from "@/components/OtpCodeInput";
import { colors, radius, spacing } from "@/theme";
import type { PublicUser, UserRole } from "@/types";

type Props = {
  purpose: "register" | "login";
  role: UserRole;
  name?: string;
  acceptedTerms?: boolean;
  onSuccess: (user: PublicUser) => void;
  onRoleMismatch?: (role: UserRole) => void;
};

type RegStep = "email" | "phone" | "website" | "otp";
type LoginStep = "identifier" | "otp";

export function OtpAuthFlow({
  purpose,
  role,
  name,
  acceptedTerms = false,
  onSuccess,
  onRoleMismatch,
}: Props) {
  const verifyOtpAuth = useAuthStore((s) => s.verifyOtpAuth);

  const [phoneRequired, setPhoneRequired] = useState(true);
  const [websiteRequired, setWebsiteRequired] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(purpose !== "register");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionIdentifier, setSessionIdentifier] = useState("");
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [masked, setMasked] = useState("");
  const [regStep, setRegStep] = useState<RegStep>("email");
  const [loginStep, setLoginStep] = useState<LoginStep>("identifier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (purpose !== "register") return;
    let cancelled = false;
    void fetchRegistrationSettings()
      .then((data) => {
        if (cancelled) return;
        setPhoneRequired(data.phoneRequiredOnRegister !== false);
        setWebsiteRequired(data.websiteRequiredOnRecruiterRegister === true);
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (!cancelled) setSettingsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [purpose]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function sendRegister(skipPhone = false) {
    setError(null);
    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }
    if (!name || name.trim().length < 2) {
      setError("Enter your full name (at least 2 characters)");
      return;
    }
    if (!acceptedTerms) {
      setError("Accept the Terms and Privacy Policy to continue");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "").slice(-10);
    if (!skipPhone && phoneRequired && phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (!skipPhone && !phoneRequired && phoneDigits.length > 0 && phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number or leave blank");
      return;
    }

    setLoading(true);
    try {
      const result = await sendRegisterOtp({
        email: trimmedEmail,
        phone: skipPhone || phoneDigits.length === 0 ? undefined : phoneDigits,
        name: name.trim(),
        role: role as "job_seeker" | "recruiter",
        companyWebsite: companyWebsite.trim() || undefined,
        acceptedTerms: true,
      });

      setSessionIdentifier(result.identifier);
      setChannel(result.channel);
      setMasked(result.masked);

      if (result.channel === "email" && (skipPhone || phoneDigits.length === 0)) {
        const verified = await verifyOtpSilent({
          identifier: result.identifier,
          purpose: "register",
        });
        onSuccess(verified.user);
        return;
      }

      setRegStep("otp");
      setCountdown(60);
      setOtp("");
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function continueFromPhone() {
    setError(null);
    const phoneDigits = phone.replace(/\D/g, "").slice(-10);
    if (phoneRequired && phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (!phoneRequired && phoneDigits.length > 0 && phoneDigits.length !== 10) {
      setError("Enter a valid 10-digit mobile number or leave blank");
      return;
    }
    if (role === "recruiter" && websiteRequired) {
      setRegStep("website");
      return;
    }
    if (role === "recruiter" && companyWebsite.trim() && !isValidWebsiteInput(companyWebsite)) {
      setError("Enter a valid company website (e.g. https://company.com)");
      return;
    }
    void sendRegister(false);
  }

  function continueFromWebsite() {
    setError(null);
    const raw = companyWebsite.trim();
    if (!raw) {
      setError("Company website is required");
      return;
    }
    if (!isValidWebsiteInput(raw)) {
      setError("Enter a valid company website (e.g. https://company.com)");
      return;
    }
    void sendRegister(false);
  }

  async function sendLogin() {
    setError(null);
    const trimmed = loginInput.trim();
    if (!trimmed) {
      setError("Enter your email or mobile number");
      return;
    }
    setLoading(true);
    try {
      const result = await sendLoginOtp(trimmed);
      setSessionIdentifier(result.identifier);
      setChannel(result.channel);
      setMasked(result.masked);
      setLoginStep("otp");
      setCountdown(60);
      setOtp("");
    } catch (e) {
      const msg = getApiErrorMessage(e);
      if (msg.includes("register")) {
        setError(`${msg} Tap "Register" below to create an account.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    if (!isCompleteOtp(otp)) {
      setError(otpValidationMessage());
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { user, roleCorrected } = await verifyOtpAuth({
        identifier: sessionIdentifier,
        otp,
        purpose,
        expectedRole: purpose === "login" ? role : undefined,
      });
      if (roleCorrected) onRoleMismatch?.(user.role);
      onSuccess(user);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  if (purpose === "login" && loginStep === "otp") {
    return (
      <View>
        <View style={styles.banner}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.brandLight} />
          <Text style={styles.hint}>
            {channel === "sms" ? "6-digit SMS OTP sent to " : "6-digit code for "}
            <Text style={styles.bold}>{masked}</Text>
          </Text>
        </View>
        <OtpCodeInput value={otp} onChange={setOtp} disabled={loading} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label="Verify & sign in" onPress={() => void onVerify()} loading={loading} disabled={!isCompleteOtp(otp)} />
        <View style={styles.row}>
          <Pressable onPress={() => { setLoginStep("identifier"); setOtp(""); setError(null); }}>
            <Text style={styles.linkMuted}>← Change email / mobile</Text>
          </Pressable>
          <Pressable disabled={countdown > 0 || loading} onPress={() => void sendLogin()}>
            <Text style={[styles.link, countdown > 0 && styles.linkOff]}>
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (purpose === "register" && regStep === "otp") {
    return (
      <View>
        <View style={styles.banner}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.brandLight} />
          <Text style={styles.hint}>
            6-digit SMS OTP sent to <Text style={styles.bold}>{masked}</Text>
          </Text>
        </View>
        <OtpCodeInput value={otp} onChange={setOtp} disabled={loading} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label="Verify & create account" onPress={() => void onVerify()} loading={loading} disabled={!isCompleteOtp(otp)} />
        <View style={styles.row}>
          <Pressable
            onPress={() => {
              setRegStep(role === "recruiter" && websiteRequired ? "website" : "phone");
              setOtp("");
              setError(null);
            }}
          >
            <Text style={styles.linkMuted}>← Go back</Text>
          </Pressable>
          <Pressable disabled={countdown > 0 || loading} onPress={() => void sendRegister(false)}>
            <Text style={[styles.link, countdown > 0 && styles.linkOff]}>
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (purpose === "register" && regStep === "website") {
    return (
      <View>
        <AppInput
          label="Company website"
          icon="globe-outline"
          value={companyWebsite}
          onChangeText={setCompanyWebsite}
          placeholder="https://yourcompany.com"
          autoCapitalize="none"
          keyboardType="url"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton label="Continue to OTP" onPress={continueFromWebsite} loading={loading} disabled={!companyWebsite.trim()} />
        <Pressable onPress={() => { setRegStep("phone"); setError(null); }} style={styles.backBtn}>
          <Text style={styles.linkMuted}>← Change mobile</Text>
        </Pressable>
      </View>
    );
  }

  if (purpose === "register" && regStep === "phone") {
    return (
      <View>
        <Text style={styles.stepHint}>Email: <Text style={styles.bold}>{email}</Text></Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <View style={styles.phoneInput}>
            <AppInput
              label={phoneRequired ? "Mobile number" : "Mobile (optional)"}
              icon="call-outline"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
              placeholder={phoneRequired ? "9876543210" : "Optional"}
            />
          </View>
        </View>
        {role === "recruiter" && !websiteRequired ? (
          <AppInput
            label="Company website (optional)"
            icon="globe-outline"
            value={companyWebsite}
            onChangeText={setCompanyWebsite}
            placeholder="https://yourcompany.com"
            autoCapitalize="none"
            keyboardType="url"
          />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          label={
            phone.length === 10
              ? "Send OTP to mobile"
              : phoneRequired
                ? "Enter mobile to continue"
                : "Continue with email only"
          }
          onPress={continueFromPhone}
          loading={loading}
          disabled={phoneRequired && phone.length !== 10}
        />
        {!phoneRequired ? (
          <Pressable
            disabled={loading}
            onPress={() => {
              if (role === "recruiter" && websiteRequired) {
                setRegStep("website");
                return;
              }
              void sendRegister(true);
            }}
            style={styles.skipBtn}
          >
            <Text style={styles.link}>Skip mobile — register with email only</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => { setRegStep("email"); setError(null); }} style={styles.backBtn}>
          <Text style={styles.linkMuted}>← Change email</Text>
        </Pressable>
      </View>
    );
  }

  if (purpose === "register") {
    if (!settingsLoaded) {
      return <Text style={styles.hint}>Loading registration settings…</Text>;
    }
    return (
      <View>
        <AppInput
          label="Email address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton
          label="Continue"
          onPress={() => {
            setError(null);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setError("Enter a valid email address");
              return;
            }
            setRegStep("phone");
          }}
          disabled={!email.trim().includes("@")}
        />
      </View>
    );
  }

  return (
    <View>
      <AppInput
        label="Email or mobile number"
        icon="person-outline"
        value={loginInput}
        onChangeText={setLoginInput}
        placeholder="you@example.com or 9876543210"
        autoCapitalize="none"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton label="Send OTP" onPress={() => void sendLogin()} loading={loading} disabled={!loginInput.trim()} />
      <View style={styles.secure}>
        <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
        <Text style={styles.secureText}>Secure OTP verification</Text>
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
  banner: {
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
  stepHint: { fontSize: 13, color: colors.slate600, marginBottom: spacing.sm },
  hint: { fontSize: 13, color: colors.slate600, flex: 1, lineHeight: 18 },
  bold: { fontWeight: "700", color: colors.brand },
  error: { color: colors.red, fontSize: 13, marginBottom: spacing.sm },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  link: { color: colors.brandLight, fontWeight: "700", fontSize: 13, textAlign: "center" },
  linkMuted: { color: colors.slate400, fontWeight: "600", fontSize: 13 },
  linkOff: { color: colors.slate400 },
  skipBtn: { marginTop: spacing.md, alignItems: "center" },
  backBtn: { marginTop: spacing.sm, alignItems: "center" },
  secure: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  secureText: { fontSize: 12, color: colors.slate500 },
});
