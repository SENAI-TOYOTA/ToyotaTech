import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Eye } from "lucide-react-native";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

export default function RegisterScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Logo size={60} />
          </View>

          <Text style={styles.welcomeText}>BEM-VINDO(A)!</Text>

          <View style={styles.formContainer}>
            <View style={styles.visibilityRow}>
              <Eye size={18} strokeWidth={1.8} color={colors.black} />
              <Text style={styles.visibilityText}>EXIBIR</Text>
            </View>

            <TextInput
              placeholder="SENHA *"
              containerStyle={styles.passwordInputContainer}
              style={styles.passwordInputText}
            />

            <Text style={styles.passwordHintText}>
              Mínimo de 8 caracteres com pelo menos uma letrar maiúscula, uma
              minúscula e um número.
            </Text>

            <Button
              title="Criar conta"
              variant="primary"
              icon={
                <ArrowRight
                  size={36}
                  strokeWidth={3}
                  color={colors.white}
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                />
              }
              style={styles.createAccountButton}
            />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.footerText}>todos os direitos reservados © 2026</Text>
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
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  welcomeText: {
    marginTop: 66,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  formContainer: {
    width: "100%",
    marginTop: 74,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 6,
    marginBottom: 6,
  },
  visibilityText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.black,
  },
  passwordInputContainer: {
    width: "100%",
    height: 50,
    paddingVertical: 0,
    paddingHorizontal: 12,
  },
  passwordInputText: {
    fontFamily: fonts.regular,
    fontSize: 18,
  },
  passwordHintText: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  createAccountButton: {
    width: "100%",
    marginTop: spacing.xl,
  },
  bottomSection: {
    alignItems: "center",
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.black,
  },
});
