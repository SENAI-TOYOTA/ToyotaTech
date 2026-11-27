import { useRouter } from "expo-router";
import {
  Accessibility as AccessibilityIcon,
  ArrowRight,
  ChevronRight,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
} from "react-native-reanimated";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileForm } from "@/hooks/useProfileForm";
import {
  borders,
  colors,
  fontSize,
  fonts,
  radii,
  sizes,
  spacing,
  textStyles,
} from "@/theme";

const profileLoadingSlots = [
  "fullName",
  "birthDate",
  "cpf",
  "email",
  "password",
];

const accessibilityIconBoxSize = spacing.xxl + spacing.md;

export default function ProfileScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { signOut, user, token, sessionPersistence } = useAuth();
  const [saveSuccess, setSaveSuccess] = useState(false);
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
  const email = user?.email || "Não informado";

  useEffect(() => {
    if (!formError) {
      return;
    }
    setSaveSuccess(false);
    AccessibilityInfo.announceForAccessibility(formError);
  }, [formError]);

  useEffect(() => {
    if (saveSuccess) {
      AccessibilityInfo.announceForAccessibility("Perfil salvo com sucesso.");
    }
  }, [saveSuccess]);

  const handleFullNameChange = (value: string) => {
    setFullName(value);
    setSaveSuccess(false);
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(formatBirthDate(value));
    setSaveSuccess(false);
  };

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    const saved = await saveProfile();
    if (saved) {
      setSaveSuccess(true);
    }
  };

  return (
    <Screen keyboardAvoiding contentStyle={styles.contentContainer}>
      <Animated.View
        entering={
          reduceMotion ? undefined : FadeInDown.duration(600).springify()
        }
      >
        <ScreenSectionHeader
          title="Perfil"
          subtitle="Suas informações pessoais"
          style={styles.sectionHeader}
        />
      </Animated.View>

      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.delay(200).duration(600).springify()
        }
        style={styles.formContainer}
      >
        {isLoadingProfile ? (
          profileLoadingSlots.map((slotId, index) => (
            <Skeleton
              key={slotId}
              height={sizes.inputField}
              borderRadius={radii.sm}
              accessibilityLabel={index === 0 ? "Carregando perfil" : undefined}
            />
          ))
        ) : (
          <>
            <TextField
              label="Nome completo"
              value={fullName}
              onChangeText={handleFullNameChange}
              accessibilityLabel="Nome completo"
              containerStyle={styles.inputContainer}
              style={styles.inputText}
            />
            <TextField
              label="Data de nascimento"
              placeholder="DD/MM/AAAA"
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
              accessibilityLabel="Data de nascimento"
              accessibilityHint="Informe no formato dia, mês e ano"
              containerStyle={styles.inputContainer}
              style={styles.inputText}
            />
            <View style={styles.cpfGroup}>
              <TextField
                label="CPF"
                value={cpf}
                onChangeText={handleCpfChange}
                keyboardType="numeric"
                maxLength={14}
                editable={!isCpfLocked}
                accessibilityLabel="CPF"
                accessibilityHint={
                  isCpfLocked ? "CPF não pode ser alterado" : undefined
                }
                accessibilityState={
                  isCpfLocked ? { disabled: true } : undefined
                }
                containerStyle={styles.inputContainer}
                style={[
                  styles.inputText,
                  isCpfLocked && styles.inputTextLocked,
                ]}
              />
              {isCpfLocked ? (
                <Text style={textStyles.caption}>
                  CPF não pode ser alterado.
                </Text>
              ) : null}
            </View>
            <Card padding={0}>
              <View
                accessible
                accessibilityLabel={`Email: ${email}`}
                style={styles.accountRow}
              >
                <Text style={styles.accountLabel}>Email</Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={styles.accountValue}
                >
                  {email}
                </Text>
              </View>
            </Card>
            {formError ? (
              <Text style={styles.formErrorText}>{formError}</Text>
            ) : null}
            {saveSuccess ? (
              <Text style={styles.saveSuccessText}>
                Perfil salvo com sucesso.
              </Text>
            ) : null}
            {sessionPersistence !== "persistent" ? (
              <Text style={styles.formErrorText}>
                Não foi possível salvar sua sessão neste dispositivo. Você
                precisará entrar novamente ao reabrir o app.
              </Text>
            ) : null}
          </>
        )}
      </Animated.View>
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.delay(300).duration(600).springify()
        }
        style={styles.accessibilitySection}
      >
        <InteractivePressable
          onPress={() => router.push("/accessibility")}
          accessibilityRole="button"
          accessibilityLabel="Acessibilidade"
          accessibilityHint="Abre as opções de acessibilidade"
        >
          <Card style={styles.accessibilityCard}>
            <View style={styles.accessibilityIconBox}>
              <AccessibilityIcon
                size={fontSize.xxl}
                strokeWidth={borders.strong}
                color={colors.white}
              />
            </View>
            <View style={styles.accessibilityText}>
              <Text style={styles.accessibilityTitle}>Acessibilidade</Text>
              <Text style={styles.accessibilitySubtitle}>
                Leitor de tela, movimento e texto
              </Text>
            </View>
            <ChevronRight
              size={fontSize.xl}
              strokeWidth={borders.strong}
              color={colors.black}
            />
          </Card>
        </InteractivePressable>
      </Animated.View>
      <Animated.View
        entering={
          reduceMotion
            ? undefined
            : FadeInDown.delay(400).duration(600).springify()
        }
        style={styles.actionContainer}
      >
        <Button
          title="Sair"
          variant="outline"
          style={styles.logoutButton}
          onPress={async () => {
            await signOut();
            router.replace("/");
          }}
        />
        <Button
          title="Salvar"
          shadowPosition="right"
          loading={isSaving}
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
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.md,
  },
  formContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  inputContainer: {
    minHeight: sizes.inputField,
    paddingVertical: 0,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
  },
  inputText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  inputTextLocked: {
    color: colors.textSecondary,
  },
  cpfGroup: {
    gap: spacing.xs,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - spacing.xs,
  },
  accountLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  accountValue: {
    flexShrink: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "right",
  },
  accessibilitySection: {
    marginTop: spacing.lg,
  },
  accessibilityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  accessibilityIconBox: {
    width: accessibilityIconBoxSize,
    height: accessibilityIconBoxSize,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  accessibilityText: {
    flex: 1,
    gap: spacing.xs - 2,
  },
  accessibilityTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  accessibilitySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  formErrorText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  saveSuccessText: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  actionContainer: {
    marginTop: spacing.lg,
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
