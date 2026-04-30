import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";
import { ArrowRight } from "lucide-react-native";

import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.logoContainer}>
            <Logo size={36} />
          </View>

          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>Suas informações pessoais</Text>

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
          <Button title="Salvar" style={styles.saveButton} icon={<ArrowRight size={36} strokeWidth={3} color={colors.white} strokeLinecap="butt" strokeLinejoin="round" />} />
        </View>

        <View style={styles.navigationBar}>
          <CircleDollarSign size={22} strokeWidth={1.8} color={colors.black} />
          <CarFront size={22} strokeWidth={1.8} color={colors.black} />
          <Bell size={22} strokeWidth={1.8} color={colors.black} />
          <User size={22} strokeWidth={1.8} color={colors.black} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.grayLight,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.xxl + spacing.xxl + spacing.xl,
  },
  logoContainer: {
    alignSelf: "flex-start",
  },
  title: {
    marginTop: spacing.xxl + spacing.lg + spacing.md,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: "#5C5C5C",
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
  navigationBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: spacing.xxl + 2,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
});
