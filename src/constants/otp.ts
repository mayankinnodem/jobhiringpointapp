/** OTP length for SMS/email verification — keep app & web in sync */
export const OTP_LENGTH = 6;

export const OTP_PLACEHOLDER = "000000";

export function normalizeOtpInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function isCompleteOtp(raw: string): boolean {
  return normalizeOtpInput(raw).length === OTP_LENGTH;
}

export function otpFieldLabel(): string {
  return `${OTP_LENGTH}-digit OTP`;
}

export function otpValidationMessage(): string {
  return `Enter the ${OTP_LENGTH}-digit OTP`;
}
