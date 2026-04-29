import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Eye } from "lucide-react-native";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize } from "@/constants/theme";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Logo size={60} />
          </View>

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

            <Button
              title="Fazer login"
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
              style={styles.loginButton}
            />

            <Text style={styles.termsText}>
              Ao clicar em fazer login, você concorda{"\n"}com os{" "}
              <Text style={styles.termsLink}>Termos e Condições ToyotaTech</Text>.
            </Text>

            <Text style={styles.forgotPasswordText}>ESQUECEU A SENHA?</Text>
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
  formContainer: {
    width: "100%",
    marginTop: 168,
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
  loginButton: {
    width: "100%",
    marginTop: 16,
  },
  termsText: {
    marginTop: 22,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  termsLink: {
    textDecorationLine: "underline",
  },
  forgotPasswordText: {
    marginTop: 38,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    textDecorationLine: "underline",
    color: colors.textPrimary,
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
