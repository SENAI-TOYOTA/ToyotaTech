import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import FormMessage from "@/components/ui/FormMessage";
import PasswordInput from "@/components/ui/PasswordInput";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";
import { ApiError } from "@/services/api";
import { colors, fonts, fontSize, spacing } from "@/theme";
import { AuthScreenLayout } from "./_layout";

export default function LoginScreen() {
  const router = useRouter();
  const { email: emailFromParams } = useLocalSearchParams<{ email?: string }>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(emailFromParams ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit =
    normalizedEmail.includes("@") && password.length >= 8 && !isSubmitting;

  const handleLoginPress = async () => {
    if (!canSubmit) {
      setFormError(
        "Enter a valid email and a password with at least 8 characters."
      );
      return;
    }

    setFormError(null);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    setIsSubmitting(true);
    try {
      await signIn(normalizedEmail, password);
      router.replace("/home");
    } catch (error) {
      console.error("[Login] Sign-in failed:", error);
      if (error instanceof ApiError) {
        if (error.status === 403) {
          router.push({
            pathname: "/(auth)/verify-email",
            params: { email: normalizedEmail },
          });
          return;
        }
        setFormError(error.message);
      } else {
        setFormError("Unable to sign in. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      showBack
      title="Sign in"
      subtitle="Enter your password to access your ToyotaTech account."
    >
      <View style={styles.form}>
        <TextInput
          label="Email address"
          placeholder="name@example.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <PasswordInput
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLoginPress}
          returnKeyType="go"
        />

        <FormMessage message={formError} />

        <Button
          title={isSubmitting ? "Signing in..." : "Sign in"}
          loading={isSubmitting}
          icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
          style={styles.submit}
          onPress={handleLoginPress}
          disabled={!canSubmit}
        />

        <Text style={styles.termsText}>
          {t("By signing in, you agree to the")}{" "}
          <Text style={styles.termsLink}>
            {t("ToyotaTech Terms and Conditions")}
          </Text>
          .
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t("New to ToyotaTech?")}</Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={6}
            onPress={() => {
              router.push({
                pathname: "/(auth)/register",
                params: { email: normalizedEmail },
              });
            }}
          >
            <Text style={styles.switchLink}>{t("Create account")}</Text>
          </Pressable>
        </View>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md + 4,
  },
  submit: {
    marginTop: spacing.xs,
  },
  termsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: "center",
  },
  termsLink: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    textDecorationLine: "underline",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  switchLink: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
});
