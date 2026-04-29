import { View, Text, StyleSheet } from "react-native";
import { ArrowRight, Eye } from "lucide-react-native";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize } from "@/constants/theme";
import { AuthScreenLayout } from "./_layout";

export default function LoginScreen() {
  return (
    <AuthScreenLayout>
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
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
});
