import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import Checkbox from "expo-checkbox";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import SocialButton from "@/components/ui/SocialButton";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { AuthScreenLayout } from "./_layout";

const googleIcon = require("@/assets/images/google-icon.png");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const canContinue = normalizedEmail.includes("@") && acceptedTerms;

  const handleContinuePress = () => {
    if (!canContinue) {
      setFormError("Preencha e-mail valido e aceite os termos.");
      return;
    }

    setFormError(null);
    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    router.push({
      pathname: "/(auth)/login",
      params: { email: normalizedEmail },
    });
  };

  return (
    <AuthScreenLayout
      contentSectionStyle={styles.contentSection}
      footerTextColor={colors.textSecondary}
      bottomContent={
        <View style={styles.bottomContentContainer}>
          <Button
            title="Prosseguir"
            variant="primary"
            icon={<ArrowRight size={36} strokeWidth={3} color={colors.white} strokeLinecap="butt" strokeLinejoin="round" />}
            style={styles.continueButton}
            onPress={handleContinuePress}
            disabled={!canContinue}
          />
        </View>
      }
    >
      <View style={styles.formSection}>
        <SocialButton icon={googleIcon} />
        <TextInput
          placeholder="ENDEREÇO DE EMAIL *"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.termsContainer}>
          <Checkbox
            value={acceptedTerms}
            onValueChange={setAcceptedTerms}
            style={styles.checkbox}
            color={acceptedTerms ? colors.black : undefined}
          />
          <Text style={styles.termsText}>
            Ao clicar em prosseguir, você{"\n"}concorda com os{" "}
            <Text style={styles.termsLink}>
              Termos e{"\n"}Condições ToyotaTech
            </Text>
            .
          </Text>
        </View>
        {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    marginTop: spacing.xl + spacing.xl + spacing.sm,
  },
  formSection: {
    gap: spacing.lg,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 2,
    marginTop: 2,
    borderColor: colors.black,
  },
  termsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
  termsLink: {
    textDecorationLine: "underline",
    fontFamily: fonts.medium,
  },
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  bottomContentContainer: {
    width: "100%",
  },
  continueButton: {
    width: "100%",
  },
});
