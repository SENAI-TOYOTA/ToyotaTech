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

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, token, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);

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
        setBirthDate(profileResult.profile.birthDate ?? "");
        setFormError(null);
      } catch (error) {
        if (!isActive) {
          return;
        }
        if (error instanceof ApiError) {
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
        <ScreenSectionHeader
          title="Perfil"
          subtitle="Suas informações pessoais"
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
            placeholder="Data de nascimento"
            value={birthDate}
            onChangeText={setBirthDate}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={false}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
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
            setIsSaving(true);
            setFormError(null);
            try {
              await updateProfile(token, {
                fullName,
                birthDate,
              });
              setPassword("");
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
