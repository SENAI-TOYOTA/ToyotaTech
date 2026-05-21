import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { ApiError } from "@/services/api";
import { fetchProfile, updateProfile } from "@/services/profile";

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

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { token, user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.profile) {
      setFullName(user.profile.fullName ?? "");
      setBirthDate(formatBirthDate(user.profile.birthDate ?? ""));
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
        setFullName(profileResult.profile.fullName ?? "");
        setBirthDate(formatBirthDate(profileResult.profile.birthDate ?? ""));
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
    if (!fullName.trim() || !birthDate.trim()) {
      setFormError("Preencha nome completo e data de nascimento.");
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      await updateProfile(token, {
        fullName: fullName.trim(),
        birthDate: birthDate.trim(),
      });
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
