import { useRouter } from "expo-router";
import { ArrowRight, KeyRound } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormMessage from "@/components/ui/FormMessage";
import PasswordInput from "@/components/ui/PasswordInput";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import { t } from "@/i18n";
import { validatePassword } from "@/profileValidation";
import { ApiError } from "@/services/api";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

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
          setFormError("Unable to set password. Try again.");
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
    <SafeAreaView style={styles.safeArea}>
      <Screen maxWidth={560} showFooter={false}>
        <Logo size={fontSize.xl + 2} />
        <ScreenSectionHeader
          eyebrow="ONE LAST STEP"
          title="Complete your profile"
          subtitle="We use this information to find your purchase and link it to your account."
        />

        <Card>
          <View style={styles.form}>
            <TextInput
              label="Full name"
              placeholder="Your full name"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              label="Birth date"
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChangeText={(text) => setBirthDate(formatBirthDate(text))}
              keyboardType="numeric"
              maxLength={10}
            />
            <TextInput
              label="CPF"
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCpf(text))}
              keyboardType="numeric"
              maxLength={14}
              editable={!isCpfLocked}
            />
          </View>
        </Card>

        {isFederatedUser ? (
          <Card>
            <View style={styles.passwordHeader}>
              <View style={styles.passwordIcon}>
                <KeyRound size={20} strokeWidth={1.8} color={colors.primary} />
              </View>
              <View style={styles.passwordHeaderText}>
                <Text style={styles.passwordTitle}>
                  {t("Create a password (optional)")}
                </Text>
                <Text style={styles.passwordSubtitle}>
                  {t(
                    "Sign in with email and password too, without using the Google button."
                  )}
                </Text>
              </View>
            </View>
            <PasswordInput
              label="New password"
              placeholder="Create a password"
              autoComplete="new-password"
              value={password}
              onChangeText={setPasswordValue}
              hint="At least 8 characters with one uppercase, one lowercase and one number."
            />
            <FormMessage
              message={passwordSuccess ? "Password set successfully!" : null}
              tone="success"
              style={styles.passwordMessage}
            />
          </Card>
        ) : null}

        <FormMessage message={formError} />

        <Button
          title={isSaving ? "Saving..." : "Save and continue"}
          loading={isSaving}
          icon={<ArrowRight size={20} strokeWidth={2.4} color={colors.white} />}
          disabled={isLoadingProfile || !token}
          onPress={handleSave}
        />
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    gap: spacing.md,
  },
  passwordHeader: {
    flexDirection: "row",
    gap: spacing.md - 4,
    marginBottom: spacing.md,
  },
  passwordIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  passwordHeaderText: {
    flex: 1,
  },
  passwordTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
  },
  passwordSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  passwordMessage: {
    marginTop: spacing.md - 4,
  },
});
