import { useRouter } from "expo-router";
import { ArrowRight, Eye } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import { validatePassword } from "@/profileValidation";
import { apiErrorMessage } from "@/services/api";
import { colors, fontSize, fonts, radii, spacing } from "@/theme";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { isFederatedUser, setPassword, token } = useAuth();
  const {
    fullName,
    setFullName,
    birthDate,
    setBirthDate,
    cpf,
    setCpf,
    isCpfLocked,
    isLoadingProfile,
    isSaving,
    formError,
    setFormError,
    saveProfile,
    formatBirthDate,
    formatCpf,
  } = useProfileForm();
  const [password, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSave = async () => {
    if (isFederatedUser && password.length > 0) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setFormError(passwordError);
        return;
      }
    }

    setPasswordSuccess(false);

    if (isFederatedUser && password.length > 0) {
      try {
        await setPassword(password);
        setPasswordSuccess(true);
      } catch (passwordError) {
        setFormError(
          apiErrorMessage(
            passwordError,
            "Não foi possível definir a senha. Tente novamente."
          )
        );
        return;
      }
    }

    const saved = await saveProfile();
    if (saved) {
      router.replace("/home");
    }
  };

  return (
    <Screen
      keyboardAvoiding
      contentStyle={styles.contentContainer}
      footer={
        <View style={styles.saveButtonContainer}>
          <Button
            title="Salvar e continuar"
            loading={isSaving}
            style={styles.saveButton}
            icon={
              <ArrowRight
                size={36}
                strokeWidth={3}
                color={colors.white}
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            }
            disabled={isSaving || isLoadingProfile || !token}
            onPress={handleSave}
          />
        </View>
      }
    >
      <ScreenSectionHeader
        title="Complete seu perfil"
        subtitle="Informe seus dados para continuar"
        style={styles.sectionHeader}
      />

      <View style={styles.formContainer}>
        <TextField
          label="Nome completo"
          value={fullName}
          onChangeText={setFullName}
          containerStyle={styles.inputContainer}
          style={styles.inputText}
        />
        <TextField
          label="Data de nascimento"
          placeholder="DD/MM/AAAA"
          value={birthDate}
          onChangeText={(text) => setBirthDate(formatBirthDate(text))}
          keyboardType="numeric"
          maxLength={10}
          containerStyle={styles.inputContainer}
          style={styles.inputText}
        />
        <TextField
          label="CPF"
          value={cpf}
          onChangeText={(text) => setCpf(formatCpf(text))}
          keyboardType="numeric"
          maxLength={14}
          editable={!isCpfLocked}
          containerStyle={styles.inputContainer}
          style={styles.inputText}
        />
        {isFederatedUser ? (
          <View style={styles.passwordSection}>
            <Text style={styles.passwordSectionTitle}>
              CRIAR SENHA (OPCIONAL)
            </Text>
            <Text style={styles.passwordSectionSubtitle}>
              Defina uma senha para entrar com email e senha também, sem usar o
              botão do Google.
            </Text>

            <TextField
              label="Nova senha"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPasswordValue}
              containerStyle={styles.passwordInputContainer}
              style={styles.inputText}
            />
            <InteractivePressable
              style={styles.visibilityRow}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Eye size={18} strokeWidth={1.8} color={colors.black} />
              <Text style={styles.visibilityText}>
                {showPassword ? "OCULTAR" : "EXIBIR"}
              </Text>
            </InteractivePressable>

            <Text style={styles.passwordHintText}>
              Mínimo de 8 caracteres com pelo menos uma letra maiúscula, uma
              minúscula e um número.
            </Text>

            {passwordSuccess ? (
              <Text style={styles.passwordSuccessText}>
                Senha definida com sucesso!
              </Text>
            ) : null}
          </View>
        ) : null}

        {formError ? (
          <Text style={styles.formErrorText}>{formError}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xxl + spacing.xxl + spacing.xl,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  formContainer: {
    marginTop: spacing.xl + spacing.sm + 2,
    gap: spacing.md,
  },
  inputContainer: {
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radii.none,
    backgroundColor: colors.white,
  },
  inputText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  passwordSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  passwordSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
    letterSpacing: 0.5,
  },
  passwordSectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  passwordInputContainer: {
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radii.none,
    backgroundColor: colors.white,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
  },
  visibilityText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.black,
  },
  passwordHintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  passwordSuccessText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  saveButtonContainer: {
    position: "absolute",
    left: spacing.lg + 3,
    right: spacing.lg + 3,
    bottom: spacing.xxl + spacing.md,
    zIndex: 1,
  },
  saveButton: {
    width: "100%",
  },
});
