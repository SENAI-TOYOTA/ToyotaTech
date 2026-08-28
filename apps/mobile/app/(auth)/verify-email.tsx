import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";

import Button from "@/components/ui/Button";
import { ApiError } from "@/services/api";
import { resendVerification, verifyEmail } from "@/services/auth";
import { colors, fonts, fontSize, spacing } from "@/theme";
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
    <AuthScreenLayout contentSectionStyle={styles.contentSection}>
      <Text style={styles.title}>VERIFY YOUR EMAIL</Text>
      <Text style={styles.subtitle}>
        Do not forget to check your spam folder!
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.emailRow}>
          <Text style={styles.emailLabel}>Email sent to:</Text>
          <Text style={styles.emailValue}>{email || "your email"}</Text>
        </View>

        <View style={styles.codeInputsRow}>
          <OtpInput
            ref={otpRef}
            numberOfDigits={CODE_LENGTH}
            focusColor={colors.primary}
            focusStickBlinkingDuration={500}
            onTextChange={(text) => setVerificationCode(text)}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
        </View>

        <Button
          title={isSubmitting ? "Verifying..." : "Verify"}
          variant="primary"
          icon={
            <ArrowRight
              size={36}
              strokeWidth={3}
              color={colors.white}
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          }
          style={styles.verifyButton}
          onPress={handleVerifyPress}
          disabled={isSubmitting || isResending}
        />
        <Button
          title={isResending ? "Resending..." : "Resend code"}
          variant="outline"
          style={styles.resendButton}
          onPress={handleResendPress}
          disabled={isSubmitting || isResending}
        />
        {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
        {formError ? (
          <Text style={styles.formErrorText}>{formError}</Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    marginTop: 58,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  formContainer: {
    marginTop: 74,
    width: "100%",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emailValue: {
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  codeInputsRow: {
    marginTop: spacing.md,
    width: "100%",
  },
  otpContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pinCodeContainer: {
    width: 46,
    height: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  activePinCodeContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pinCodeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  verifyButton: {
    width: "100%",
    marginTop: spacing.xl,
  },
  resendButton: {
    width: "100%",
    marginTop: spacing.sm,
  },
  feedbackText: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  formErrorText: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
