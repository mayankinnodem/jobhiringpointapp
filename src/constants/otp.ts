/** OTP length for SMS/email verification — keep app & web in sync (always 6). */
export const OTP_LENGTH = 6 as const;

export const OTP_PLACEHOLDER = "000000";

export function normalizeOtpInput(raw: string): string {
  return String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, OTP_LENGTH);
}

export function isCompleteOtp(raw: string): boolean {
  const digits = normalizeOtpInput(raw);
  return digits.length === OTP_LENGTH && /^\d{6}$/.test(digits);
}

export function otpFieldLabel(): string {
  return `${OTP_LENGTH}-digit OTP`;
}

export function otpValidationMessage(): string {
  return `Enter the ${OTP_LENGTH}-digit OTP sent via SMS`;
}
