import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import { useGarage } from "@/hooks/useGarage";
import { borders, colors, fontSize, fonts, radii, spacing } from "@/theme";
import { isValidBoletoBarcode } from "@/utils/format";

export default function FinancingScreen() {
  const router = useRouter();
  const { garage, isLoading, error } = useGarage();

  const financing = garage?.financing;
  const vehicleTitle = garage
    ? `${garage.vehicle.model} ${garage.vehicle.year}`
    : "";
  const paidInstallments = financing
    ? `${financing.paidInstallments} / ${financing.totalInstallments}`
    : "";
  const boletoBarcode = financing?.boletoBarcode ?? "";
  const boletoAvailable =
    Boolean(financing?.boletoAvailable) && isValidBoletoBarcode(boletoBarcode);

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <ScreenSectionHeader
          title="Financiamento"
          subtitle="Acompanhe o seu financiamento"
          style={styles.sectionHeader}
        />
      </Animated.View>

      {garage && financing ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
        >
          <Card style={styles.financeCard}>
            <Text style={styles.carTitle}>{vehicleTitle}</Text>

            <View style={styles.installmentRow}>
              <Text style={styles.installmentLabel}>Parcelas pagas:</Text>
              <View style={styles.installmentBadgeWrapper}>
                <View style={styles.installmentBadgeShadow} />
                <Badge
                  label={paidInstallments}
                  style={styles.installmentBadge}
                  textStyle={styles.installmentText}
                />
              </View>
            </View>

            <Text style={styles.bankInfo}>
              Instituição financeira:{" "}
              <Text style={styles.bankName}>{financing.bank}</Text>
            </Text>
            {financing.contractNumber ? (
              <Text style={styles.contractInfo}>
                Contrato: {financing.contractNumber}
              </Text>
            ) : null}
            <Text style={styles.invoiceDescription}>
              Parcela {financing.installmentAmount} | Vencimento{" "}
              {financing.nextDueDate}
            </Text>
          </Card>
        </Animated.View>
      ) : isLoading ? (
        <Skeleton
          accessibilityLabel="Carregando financiamento"
          height={160}
          borderRadius={radii.sm}
          style={styles.financeCard}
        />
      ) : (
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.emptyCard}
        >
          <Text style={styles.emptyText}>
            {error ?? "Financiamento ainda não vinculado."}
          </Text>
        </Animated.View>
      )}

      {garage && financing ? (
        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
        >
          <Card style={styles.invoiceCard}>
            <Text style={styles.invoiceTitle}>2° Via do boleto</Text>
            <Text style={styles.invoiceDescription}>
              Baixe seus boletos e carnês com facilidade
            </Text>

            <Button
              variant="primary"
              layout="row"
              title="Acessar boleto"
              icon={
                <ArrowRight size={26} strokeWidth={2.4} color={colors.white} />
              }
              disabled={!boletoAvailable}
              onPress={
                boletoAvailable ? () => router.push("/boleto") : undefined
              }
              style={styles.invoiceButton}
            />
            {!boletoAvailable ? (
              <Text style={styles.boletoUnavailableText}>
                O boleto não está disponível para este contrato no momento.
              </Text>
            ) : null}
          </Card>
        </Animated.View>
      ) : isLoading ? (
        <Skeleton
          accessibilityLabel="Carregando boleto"
          height={142}
          borderRadius={radii.sm}
          style={styles.invoiceCard}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: spacing.lg,
  },
  financeCard: {
    marginTop: spacing.xl + spacing.md - 1,
    borderRadius: radii.sm,
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
    borderWidth: borders.thin,
    borderColor: colors.black,
    backgroundColor: "transparent",
  },
  installmentBadge: {
    width: "100%",
    height: "100%",
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  contractInfo: {
    marginTop: spacing.xs - 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyCard: {
    marginTop: spacing.xl + spacing.md - 1,
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    minHeight: 96,
    paddingHorizontal: spacing.sm + 5,
    paddingVertical: spacing.md,
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  invoiceCard: {
    marginTop: spacing.xl + spacing.xs + 1,
    borderRadius: radii.sm,
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
  invoiceButton: {
    width: 219,
    marginTop: spacing.md - 1,
  },
  boletoUnavailableText: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
