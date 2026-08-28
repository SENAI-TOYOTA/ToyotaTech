import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import TextInput from "@/components/ui/TextInput";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import { colors, fonts, fontSize, spacing } from "@/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, token } = useAuth();
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
    saveProfile,
    formatBirthDate,
    formatCpf,
  } = useProfileForm();
  const email = user?.email ?? "";
  const password = "********";

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ScreenSectionHeader
            title="Profile"
            subtitle="Your personal information"
            style={styles.sectionHeader}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.formContainer}
        >
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
          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            editable={false}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            value={password}
            editable={false}
            containerStyle={styles.inputContainer}
            style={styles.inputText}
          />
          {formError ? (
            <Text style={styles.formErrorText}>{formError}</Text>
          ) : null}
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.actionContainer}
        >
          <Button
            title="Sign out"
            variant="outline"
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              router.replace("/");
            }}
          />
          <Button
            title={isSaving ? "Saving..." : "Save"}
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
            onPress={async () => {
              await saveProfile();
            }}
          />
        </Animated.View>
      </ScrollView>
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
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  actionContainer: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoutButton: {
    width: "100%",
    borderColor: colors.black,
  },
  saveButton: {
    width: "100%",
  },
});
