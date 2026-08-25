import { useEffect, useState } from "react";
import { ArrowRight, Eye } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fonts, fontSize, spacing } from "@/theme";
import { ApiError } from "@/services/api";
import { resolveGarage } from "@/services/garage";
import { fetchProfile, updateProfile } from "@/services/profile";
import { validateBirthDate } from "@/profileValidation";

const formatBirthDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (!digits) {
    return "";
  }
  let result = digits.slice(0, 2);
  if (digits.length > 2) {
    result += `/${digits.slice(2, 4)}`;
  }
  if (digits.length > 4) {
    result += `/${digits.slice(4, 8)}`;
  }
  return result;
};

const normalizeCpf = (value: string) => value.replace(/\D/g, "").slice(0, 11);

const formatCpf = (value: string) => {
  const digits = normalizeCpf(value);
  if (!digits) {
    return "";
  }
  let result = digits.slice(0, 3);
  if (digits.length > 3) {
    result += `.${digits.slice(3, 6)}`;
  }
  if (digits.length > 6) {
    result += `.${digits.slice(6, 9)}`;
  }
  if (digits.length > 9) {
    result += `-${digits.slice(9, 11)}`;
  }
  return result;
};

const PASSWORD_MIN_LENGTH = 8;

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha deve ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter ao menos uma letra maiúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "A senha deve conter ao menos uma letra minúscula.";
  }
  if (!/[0-9]/.test(password)) {
    return "A senha deve conter ao menos um número.";
  }
  return null;
}

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { token, user, refreshUser, isFederatedUser, setPassword } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isCpfLocked, setIsCpfLocked] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      const loadedCpf = user.profile.cpf ?? "";
      setFullName(user.profile.fullName ?? "");
      setBirthDate(formatBirthDate(user.profile.birthDate ?? ""));
      setCpf(formatCpf(loadedCpf));
      setIsCpfLocked(normalizeCpf(loadedCpf).length === 11);
    }
  }, [user?.profile]);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      if (!token) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      try {
        const profileResult = await fetchProfile(token);
        if (!isActive) {
          return;
        }
        const loadedCpf = profileResult.profile.cpf ?? "";
        setFullName(profileResult.profile.fullName ?? "");
        setBirthDate(formatBirthDate(profileResult.profile.birthDate ?? ""));
        setCpf(formatCpf(loadedCpf));
        setIsCpfLocked(normalizeCpf(loadedCpf).length === 11);
        setFormError(null);
      } catch (error) {
        if (!isActive) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setFormError(null);
        } else if (error instanceof ApiError) {
          setFormError(error.message);
        } else {
          setFormError("Nao foi possivel carregar o perfil.");
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [token]);

  const handleSave = async () => {
    if (!token) {
      setFormError("Sessao invalida. Faça login novamente.");
      return;
    }
    const normalizedCpf = normalizeCpf(cpf);
    if (!fullName.trim()) {
      setFormError("Preencha o nome completo.");
      return;
    }
    const birthDateError = validateBirthDate(birthDate.trim());
    if (birthDateError) {
      setFormError(birthDateError);
      return;
    }
    if (!isCpfLocked && normalizedCpf.length !== 11) {
      setFormError("Preencha um CPF valido.");
      return;
    }

    // Se o usuário federado preencheu a senha, valida antes de salvar
    if (isFederatedUser && password.length > 0) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setFormError(passwordError);
        return;
      }
    }

    setIsSaving(true);
    setFormError(null);
    setPasswordSuccess(false);

    try {
      // Define a senha, se preenchida por usuário Google
      if (isFederatedUser && password.length > 0) {
        try {
          await setPassword(password);
          setPasswordSuccess(true);
        } catch (passwordError) {
          if (passwordError instanceof ApiError) {
            setFormError(passwordError.message);
          } else {
            setFormError("Nao foi possivel definir a senha. Tente novamente.");
          }
          setIsSaving(false);
          return;
        }
      }

      await updateProfile(token, {
        fullName: fullName.trim(),
        birthDate: birthDate.trim(),
        ...(isCpfLocked ? {} : { cpf: normalizedCpf }),
      });
      await resolveGarage(token);
      await refreshUser();
      router.replace("/home");
    } catch (error) {
      if (error instanceof ApiError) {
        setFormError(error.message);
      } else {
        setFormError("Nao foi possivel salvar o perfil.");
      }
    } finally {
      setIsSaving(false);
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
          subtitle="Informe os dados para continuar"
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

          {/* Seção de criar senha — aparece apenas para usuários Google */}
          {isFederatedUser ? (
            <View style={styles.passwordSection}>
              <Text style={styles.passwordSectionTitle}>CRIAR SENHA (OPCIONAL)</Text>
              <Text style={styles.passwordSectionSubtitle}>
                Defina uma senha para poder entrar também com e-mail e senha, sem precisar usar o
                botão do Google.
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
                <Text style={styles.visibilityText}>{showPassword ? "OCULTAR" : "EXIBIR"}</Text>
              </Pressable>

              <Text style={styles.passwordHintText}>
                Mínimo de 8 caracteres com pelo menos uma letra maiúscula, uma minúscula e um
                número.
              </Text>

              {passwordSuccess ? (
                <Text style={styles.passwordSuccessText}>Senha definida com sucesso!</Text>
              ) : null}
            </View>
          ) : null}

          {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}
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
  // Seção de senha para usuários Google
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
