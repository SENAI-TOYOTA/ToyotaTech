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

export default function RegisterScreen() {
  const router = useRouter();
  const { email: emailFromParams } = useLocalSearchParams<{ email?: string }>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState(emailFromParams ?? "");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit =
    normalizedEmail.includes("@") && password.length >= 8 && !isSubmitting;

  const handleCreateAccountPress = async () => {
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
      const result = await signUp(normalizedEmail, password);
      if (result.requiresEmailVerification) {
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: normalizedEmail },
        });
      } else {
        router.replace({
          pathname: "/(auth)/login",
          params: { email: normalizedEmail },
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Unable to create account. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      showBack
      title="Create your account"
      subtitle="It only takes a minute to start following your Toyota."
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
          placeholder="Create a password"
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleCreateAccountPress}
          hint="At least 8 characters with one uppercase, one lowercase and one number."
        />

        <FormMessage message={formError} />

        <Button
          title={isSubmitting ? "Creating account..." : "Create account"}
          loading={isSubmitting}
          icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
          style={styles.submit}
          onPress={handleCreateAccountPress}
          disabled={!canSubmit}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t("Already have an account?")}</Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={6}
            onPress={() => {
              router.replace({
                pathname: "/(auth)/login",
                params: { email: normalizedEmail },
              });
            }}
          >
            <Text style={styles.switchLink}>{t("Sign in")}</Text>
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
