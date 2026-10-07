import { useRouter } from "expo-router";
import { ArrowRight, Eye } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import { validatePassword } from "@/profileValidation";
import { ApiError } from "@/services/api";
import { colors, fonts, fontSize, spacing } from "@/theme";

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
        if (passwordError instanceof ApiError) {
          setFormError(passwordError.message);
        } else {
          setFormError("Não foi possível definir a senha. Tente novamente.");
        }
        return;
      }
    }

    const saved = await saveProfile();
    if (saved) {
      router.replace("/home");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <ScreenSectionHeader
          title="Complete seu perfil"
          subtitle="Informe seus dados para continuar"
          style={styles.sectionHeader}
        />

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Nome completo"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="Data de nascimento (DD/MM/AAAA)"
            value={birthDate}
            onChangeText={(text) => setBirthDate(formatBirthDate(text))}
            keyboardType="numeric"
            maxLength={10}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="CPF"
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
                Defina uma senha para entrar com email e senha também, sem usar
                o botão do Google.
              </Text>

              <TextInput
                placeholder="NOVA SENHA"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPasswordValue}
                containerStyle={styles.passwordInputContainer}
                style={styles.inputText}
              />
              <Pressable
                style={styles.visibilityRow}
                onPress={() => setShowPassword((current) => !current)}
              >
                <Eye size={18} strokeWidth={1.8} color={colors.black} />
                <Text style={styles.visibilityText}>
                  {showPassword ? "OCULTAR" : "EXIBIR"}
                </Text>
              </Pressable>

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
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <Button
          title={isSaving ? "Salvando..." : "Salvar e continuar"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg + 3,
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
    borderRadius: 0,
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
    borderRadius: 0,
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
