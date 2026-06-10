import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { ArrowRight, Eye } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { ApiError } from "@/services/api";
import { AuthScreenLayout } from "./_layout";

export default function RegisterScreen() {
  const router = useRouter();
  const { email: emailFromParams } = useLocalSearchParams<{ email?: string }>();
  const { signUp } = useAuth();
  const [email, setEmail] = useState(emailFromParams ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit = normalizedEmail.includes("@") && password.length >= 8 && !isSubmitting;

  const handleCreateAccountPress = async () => {
    if (!canSubmit) {
      setFormError("Informe e-mail valido e senha com ao menos 8 caracteres.");
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
        setFormError("Nao foi possivel criar a conta. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
      <Text style={styles.welcomeText}>BEM-VINDO(A)!</Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="ENDEREÇO DE EMAIL *"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="SENHA *"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.passwordInputContainer}
          style={styles.passwordInputText}
        />
        <Pressable
          style={styles.visibilityRow}
          onPress={() => setShowPassword((current) => !current)}
        >
          <Eye size={18} strokeWidth={1.8} color={colors.black} />
          <Text style={styles.visibilityText}>{showPassword ? "OCULTAR" : "EXIBIR"}</Text>
        </Pressable>

        <Text style={styles.passwordHintText}>
          Mínimo de 8 caracteres com pelo menos uma letrar maiúscula, uma
          minúscula e um número.
        </Text>

        {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

        <Button
          title={isSubmitting ? "Criando..." : "Criar conta"}
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
          style={styles.createAccountButton}
          onPress={handleCreateAccountPress}
          disabled={!canSubmit}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    marginTop: 66,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  formContainer: {
    width: "100%",
    marginTop: spacing.xxl,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    marginTop: spacing.xs,
  },
  visibilityText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.black,
  },
  passwordInputContainer: {
    width: "100%",
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: 12,
    marginTop: spacing.md,
  },
  passwordInputText: {
    fontFamily: fonts.regular,
    fontSize: 18,
  },
  passwordHintText: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  createAccountButton: {
    width: "100%",
    marginTop: spacing.xl,
  },
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
