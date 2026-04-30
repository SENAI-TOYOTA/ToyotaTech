import { useState } from "react";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <Button
          title="Salvar"
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
