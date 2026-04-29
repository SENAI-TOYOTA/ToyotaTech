import { View, Text, StyleSheet } from "react-native";
import { ArrowRight, Eye } from "lucide-react-native";

import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { AuthScreenLayout } from "./_layout";

export default function RegisterScreen() {
  return (
    <AuthScreenLayout>
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
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
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
});
