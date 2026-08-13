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

export default function LoginScreen() {
  const router = useRouter();
  const { email: emailFromParams } = useLocalSearchParams<{ email?: string }>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(emailFromParams ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canSubmit = normalizedEmail.includes("@") && password.length >= 8 && !isSubmitting;

  const handleLoginPress = async () => {
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
      await signIn(normalizedEmail, password);
      router.replace("/home");
    } catch (error) {
      console.error("[Login] Erro ao fazer login:", error);
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
        setFormError("Nao foi possivel fazer login. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout>
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

        <Button
          title={isSubmitting ? "Entrando..." : "Fazer login"}
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
          style={styles.loginButton}
          onPress={handleLoginPress}
          disabled={!canSubmit}
        />

        <Text style={styles.termsText}>
          Ao clicar em fazer login, você concorda{"\n"}com os{" "}
          <Text style={styles.termsLink}>Termos e Condições ToyotaTech</Text>.
        </Text>

        {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

        <Pressable
          onPress={() => {
            router.push({
              pathname: "/(auth)/register",
              params: { email: normalizedEmail },
            });
          }}
        >
          <Text style={styles.forgotPasswordText}>NÃO TEM CONTA? CRIAR CONTA</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    marginTop: 116,
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
  loginButton: {
    width: "100%",
    marginTop: 16,
  },
  termsText: {
    marginTop: 22,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  termsLink: {
    textDecorationLine: "underline",
  },
  forgotPasswordText: {
    marginTop: 38,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    textDecorationLine: "underline",
    color: colors.textPrimary,
  },
  formErrorText: {
    marginTop: spacing.md,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
