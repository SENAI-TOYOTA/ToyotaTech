import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  CarFront,
  FileText,
  LucideIcon,
  Wallet,
} from "lucide-react-native";
import { ReactNode } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { useIsWide } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { colors, fonts, fontSize, layout, radius, spacing } from "@/theme";

const brandImage = require("@/assets/images/corolla-news.png");

const brandHighlights: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: CarFront,
    title: "Order tracking",
    text: "Follow every step from factory to delivery.",
  },
  {
    icon: Wallet,
    title: "Financing",
    text: "Installments, due dates and invoices in one place.",
  },
  {
    icon: FileText,
    title: "Digital documents",
    text: "Keep your vehicle paperwork always at hand.",
  },
];

interface AuthScreenLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  bottomContent?: ReactNode;
  showBack?: boolean;
}

function BrandPanel() {
  return (
    <ImageBackground
      source={brandImage}
      style={styles.brandPanel}
      imageStyle={styles.brandImage}
      resizeMode="cover"
    >
      <View style={styles.brandOverlay} />
      <View style={styles.brandContent}>
        <Logo size={fontSize.xxl} inverse />
        <View style={styles.brandCopy}>
          <Text style={styles.brandEyebrow}>{t("TOYOTA AFTER-SALES")}</Text>
          <Text style={styles.brandHeadline}>
            {t("Your Toyota, from order to ownership.")}
          </Text>
          <View style={styles.brandList}>
            {brandHighlights.map(({ icon: Icon, title, text }) => (
              <View key={title} style={styles.brandItem}>
                <View style={styles.brandIcon}>
                  <Icon size={18} strokeWidth={1.8} color={colors.white} />
                </View>
                <View style={styles.brandItemText}>
                  <Text style={styles.brandItemTitle}>{t(title)}</Text>
                  <Text style={styles.brandItemBody}>{t(text)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

export function AuthScreenLayout({
  children,
  title,
  subtitle,
  bottomContent,
  showBack = false,
}: AuthScreenLayoutProps) {
  const router = useRouter();
  const isWide = useIsWide();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.row}>
        {isWide ? <BrandPanel /> : null}
        <KeyboardAvoidingView
          style={styles.formSide}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formColumn}>
              <View style={styles.topBar}>
                {showBack && router.canGoBack() ? (
                  <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel={t("Go back")}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.backButton,
                      pressed && styles.backButtonPressed,
                    ]}
                  >
                    <ArrowLeft
                      size={20}
                      strokeWidth={2}
                      color={colors.textPrimary}
                    />
                  </Pressable>
                ) : null}
                {isWide ? null : <Logo size={fontSize.xxl - 2} />}
              </View>

              <View style={styles.body}>
                {title ? (
                  <Text style={styles.title} accessibilityRole="header">
                    {t(title)}
                  </Text>
                ) : null}
                {subtitle ? (
                  <Text style={styles.subtitle}>{t(subtitle)}</Text>
                ) : null}
                <View style={styles.children}>{children}</View>
                {bottomContent ? (
                  <View style={styles.bottomContent}>{bottomContent}</View>
                ) : null}
              </View>

              <View style={styles.bottom}>
                <Text style={styles.footerText}>
                  {t("2026 ToyotaTech. All rights reserved.")}
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  brandPanel: {
    flex: 1.1,
    backgroundColor: colors.ink,
  },
  brandImage: {
    opacity: 0.9,
  },
  brandOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 20, 24, 0.62)",
  },
  brandContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.xxl,
  },
  brandCopy: {
    maxWidth: 480,
  },
  brandEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 2,
    color: colors.primary,
  },
  brandHeadline: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: fontSize.display + 4,
    lineHeight: 48,
    color: colors.white,
  },
  brandList: {
    marginTop: spacing.xl,
    gap: spacing.md + 2,
  },
  brandItem: {
    flexDirection: "row",
    gap: spacing.md - 2,
    alignItems: "flex-start",
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandItemText: {
    flex: 1,
  },
  brandItemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md + 1,
    color: colors.white,
  },
  brandItemBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm + 1,
    lineHeight: 20,
    color: colors.textInverseMuted,
  },
  formSide: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  formColumn: {
    flex: 1,
    width: "100%",
    maxWidth: layout.maxFormWidth + layout.gutter * 2,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topBar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.xl,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    lineHeight: 36,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.md + 1,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  children: {
    marginTop: spacing.lg + 4,
  },
  bottomContent: {
    marginTop: spacing.lg,
  },
  bottom: {
    alignItems: "center",
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs + 1,
    color: colors.textMuted,
  },
});
