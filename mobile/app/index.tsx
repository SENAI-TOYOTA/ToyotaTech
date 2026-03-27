import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import Checkbox from "expo-checkbox";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import SocialButton from "@/components/ui/SocialButton";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

const googleIcon = require("@/assets/images/google-icon.png");

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Logo size={fontSize.logo} />
          </View>
          <View style={styles.formSection}>
            <SocialButton icon={googleIcon} />
            <TextInput placeholder="ENDEREÇO DE EMAIL *" />
            <View style={styles.termsContainer}>
              <Checkbox
                value={false}
                style={styles.checkbox}
                color={colors.black}
              />
              <Text style={styles.termsText}>
                Ao clicar em prosseguir, você{"\n"}concorda com os{" "}
                <Text style={styles.termsLink}>
                  Termos e{"\n"}Condições ToyotaTech
                </Text>
                .
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.bottomSection}>
          <Button
            title="Prosseguir"
            variant="primary"
            icon={<ArrowRight size={36} strokeWidth={3} color={colors.white} strokeLinecap="butt" strokeLinejoin="round" />}
            style={styles.continueButton}
          />
          <Text style={styles.footerText}>
            todos os direitos reservados © 2026
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 55,
    paddingTop: 48,
    paddingBottom: 48,
  },
  topSection: {
    gap: 60,
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: spacing.xl,
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
  bottomSection: {
    alignItems: "center",
    gap: spacing.lg,
  },
  continueButton: {
    width: "100%",
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
