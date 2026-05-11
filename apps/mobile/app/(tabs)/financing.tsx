import { ArrowRight } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

export default function FinancingScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <ScreenSectionHeader
          title="Financiamento"
          subtitle="Acompanhe o seu financiamento"
          style={styles.sectionHeader}
        />

        <View style={styles.financeCard}>
          <Text style={styles.carTitle}>Corolla Altis 2026</Text>

          <View style={styles.installmentRow}>
            <Text style={styles.installmentLabel}>Parcelas pagas:</Text>
            <View style={styles.installmentBadgeWrapper}>
              <View style={styles.installmentBadgeShadow} />
              <View style={styles.installmentBadge}>
                <Text style={styles.installmentText}>30 / 60</Text>
              </View>
            </View>
          </View>

          <Text style={styles.bankInfo}>
            Instituição financeira:{" "}
            <Text style={styles.bankName}>Banco Toyota do Brasil S.A</Text>
          </Text>
        </View>

        <View style={styles.invoiceCard}>
          <Text style={styles.invoiceTitle}>2° Via do boleto</Text>
          <Text style={styles.invoiceDescription}>
            Baixe seus boletos e carnês com facilidade
          </Text>

          <View style={styles.invoiceButtonWrapper}>
            <View style={styles.invoiceButtonShadow} />
            <Pressable style={styles.invoiceButton} android_ripple={{ color: "#c70818" }}>
              <Text style={styles.invoiceButtonText}>Acessar boleto</Text>
              <ArrowRight size={28} strokeWidth={2.4} color={colors.white} />
            </Pressable>
          </View>
        </View>
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
    paddingBottom: spacing.xxl + spacing.xxl,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  financeCard: {
    marginTop: spacing.xl + spacing.md - 1,
    borderWidth: 1,
    borderColor: colors.black,
    minHeight: 160,
    paddingHorizontal: spacing.sm + 5,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md - 2,
  },
  carTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  installmentRow: {
    marginTop: spacing.md - 1,
    flexDirection: "row",
    alignItems: "center",
  },
  installmentLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    width: 108,
  },
  installmentBadgeWrapper: {
    width: 100,
    height: 39,
    marginLeft: spacing.md + 1,
  },
  installmentBadgeShadow: {
    position: "absolute",
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  installmentBadge: {
    width: "100%",
    height: "100%",
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  installmentText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
  bankInfo: {
    marginTop: spacing.md + 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  bankName: {
    color: colors.primary,
  },
  invoiceCard: {
    marginTop: spacing.xl + spacing.xs + 1,
    borderWidth: 1,
    borderColor: colors.black,
    minHeight: 142,
    paddingHorizontal: spacing.sm + 5,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 4,
  },
  invoiceTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  invoiceDescription: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  invoiceButtonWrapper: {
    width: 219,
    height: 40,
    marginTop: spacing.md - 1,
    marginLeft: 1,
  },
  invoiceButtonShadow: {
    position: "absolute",
    top: 4,
    left: 6,
    right: -6,
    bottom: -4,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  invoiceButton: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm + 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  invoiceButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
});
