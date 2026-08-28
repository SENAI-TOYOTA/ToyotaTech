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
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <ScreenSectionHeader
          title="Complete your profile"
          subtitle="Provide your data to continue"
          style={styles.sectionHeader}
        />

        <View style={styles.formContainer}>
          <TextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="Birth date (DD/MM/YYYY)"
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
                CREATE PASSWORD (OPTIONAL)
              </Text>
              <Text style={styles.passwordSectionSubtitle}>
                Set a password to sign in with email and password as well,
                without using Google button.
              </Text>

              <TextInput
                placeholder="NEW PASSWORD"
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
                  {showPassword ? "HIDE" : "SHOW"}
                </Text>
              </Pressable>

              <Text style={styles.passwordHintText}>
                At least 8 characters with one uppercase, one lowercase and one
                number.
              </Text>

              {passwordSuccess ? (
                <Text style={styles.passwordSuccessText}>
                  Password set successfully!
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
          title={isSaving ? "Saving..." : "Save and continue"}
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
