import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, MailCheck } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";

import Button from "@/components/ui/Button";
import FormMessage from "@/components/ui/FormMessage";
import { t } from "@/i18n";
import { ApiError } from "@/services/api";
import { resendVerification, verifyEmail } from "@/services/auth";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";
import { AuthScreenLayout } from "./_layout";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email = "" } = useLocalSearchParams<{ email?: string }>();
  const otpRef = useRef<OtpInputRef>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVerifyPress = async () => {
    if (verificationCode.length !== CODE_LENGTH) {
      setFormError("Enter the full verification code.");
      return;
    }
    setFormError(null);
    setFeedback(null);

    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    setIsSubmitting(true);
    try {
      await verifyEmail({
        email: String(email).toLowerCase(),
        code: verificationCode,
      });
      router.replace({
        pathname: "/(auth)/login",
        params: { email: String(email).toLowerCase() },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to validate code. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPress = async () => {
    setFormError(null);
    setFeedback(null);
    setIsResending(true);
    try {
      await resendVerification(String(email).toLowerCase());
      setFeedback("Code resent.");
      setVerificationCode("");
      otpRef.current?.clear();
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to resend code.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthScreenLayout
      showBack
      title="Verify your email"
      subtitle="Enter the 6-digit code we just sent you. Remember to check your spam folder."
    >
      <View style={styles.form}>
        <View style={styles.emailCard}>
          <View style={styles.emailIcon}>
            <MailCheck size={20} strokeWidth={1.8} color={colors.primary} />
          </View>
          <View style={styles.emailText}>
            <Text style={styles.emailLabel}>{t("Code sent to")}</Text>
            <Text style={styles.emailValue} numberOfLines={1}>
              {email || t("your email")}
            </Text>
          </View>
        </View>

        <OtpInput
          ref={otpRef}
          numberOfDigits={CODE_LENGTH}
          focusColor={colors.ink}
          focusStickBlinkingDuration={500}
          onTextChange={(text) => setVerificationCode(text)}
          onFilled={(text) => setVerificationCode(text)}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.pinCodeContainer,
            pinCodeTextStyle: styles.pinCodeText,
            focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            filledPinCodeContainerStyle: styles.filledPinCodeContainer,
          }}
        />

        <FormMessage message={feedback} tone="success" />
        <FormMessage message={formError} />

        <Button
          title={isSubmitting ? "Verifying..." : "Verify email"}
          loading={isSubmitting}
          icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
          onPress={handleVerifyPress}
          disabled={isResending || verificationCode.length !== CODE_LENGTH}
        />
        <Button
          title={isResending ? "Resending..." : "Resend code"}
          variant="ghost"
          size="md"
          loading={isResending}
          onPress={handleResendPress}
          disabled={isSubmitting}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md + 4,
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    padding: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emailText: {
    flex: 1,
    minWidth: 0,
  },
  emailLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emailValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  otpContainer: {
    width: "100%",
    gap: spacing.sm,
  },
  pinCodeContainer: {
    flex: 1,
    height: 58,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  activePinCodeContainer: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  filledPinCodeContainer: {
    borderColor: colors.ink,
  },
  pinCodeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
});
