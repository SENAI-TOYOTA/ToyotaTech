import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { validateBirthDate } from "@/profileValidation";
import { ApiError } from "@/services/api";
import { resolveGarage } from "@/services/garage";
import { fetchProfile, updateProfile } from "@/services/profile";
import { colors, fonts, fontSize, spacing } from "@/theme";
import { formatBirthDate, formatCpf, normalizeCpf } from "@/utils/format";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, token, user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password] = useState("********");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCpfLocked, setIsCpfLocked] = useState(false);

  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);

  useEffect(() => {
    const loadedCpf = user?.profile?.cpf ?? "";
    if (normalizeCpf(loadedCpf).length === 11) {
      setCpf(formatCpf(loadedCpf));
      setIsCpfLocked(true);
    }
  }, [user?.profile?.cpf]);

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

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ScreenSectionHeader
            title="Perfil"
            subtitle="Suas informações pessoais"
            style={styles.sectionHeader}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.formContainer}
        >
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
          <TextInput
            placeholder="e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            editable={false}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="Senha"
            secureTextEntry
            value={password}
            editable={false}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          {formError ? (
            <Text style={styles.formErrorText}>{formError}</Text>
          ) : null}
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.actionContainer}
        >
          <Button
            title="Sair da conta"
            variant="outline"
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              router.replace("/");
            }}
          />
          <Button
            title={isSaving ? "Salvando..." : "Salvar"}
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
            onPress={async () => {
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
              setIsSaving(true);
              setFormError(null);
              try {
                await updateProfile(token, {
                  fullName: fullName.trim(),
                  birthDate: birthDate.trim(),
                  ...(isCpfLocked ? {} : { cpf: normalizedCpf }),
                });
                await resolveGarage(token);
                await refreshUser();
              } catch (error) {
                if (error instanceof ApiError) {
                  setFormError(error.message);
                } else {
                  setFormError("Nao foi possivel salvar o perfil.");
                }
              } finally {
                setIsSaving(false);
              }
            }}
          />
        </Animated.View>
      </ScrollView>
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
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  actionContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoutButton: {
    width: "100%",
    borderColor: colors.black,
  },
  saveButton: {
    width: "100%",
  },
});
