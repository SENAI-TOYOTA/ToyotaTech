import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGarageCurrent } from "@/services/garage";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { GarageData } from "@/types/garage";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function InteractivePressable({
  children,
  style,
  onPress,
  ...props
}: React.ComponentProps<typeof Pressable>) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}

export default function FinancingScreen() {
  const { token } = useAuth();
  const [garage, setGarage] = useState<GarageData | null>(null);

  useEffect(() => {
    let active = true;
    const loadGarage = async () => {
      if (!token) {
        return;
      }
      try {
        const result = await fetchGarageCurrent(token);
        if (active) {
          setGarage(result.garage);
        }
      } catch (error) {
        console.error("Failed to fetch financing data", error);
      }
    };

    void loadGarage();
    return () => {
      active = false;
    };
  }, [token]);

  const financing = garage?.financing;
  const vehicleTitle = garage ? `${garage.vehicle.model} ${garage.vehicle.year}` : "Corolla Altis 2026";
  const paidInstallments = financing ? `${financing.paidInstallments} / ${financing.totalInstallments}` : "30 / 60";
  const bankName = financing?.bank ?? "Banco Toyota do Brasil S.A";
  const installmentAmount = financing?.installmentAmount ?? "R$ 2.480,00";
  const nextDueDate = financing?.nextDueDate ?? "10/06/2026";
  const boletoAvailable = financing?.boletoAvailable ?? true;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ScreenSectionHeader
            title="Financiamento"
            subtitle="Acompanhe o seu financiamento"
            style={styles.sectionHeader}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          style={styles.financeCard}
        >
          <Text style={styles.carTitle}>{vehicleTitle}</Text>

          <View style={styles.installmentRow}>
            <Text style={styles.installmentLabel}>Parcelas pagas:</Text>
            <View style={styles.installmentBadgeWrapper}>
              <View style={styles.installmentBadgeShadow} />
              <View style={styles.installmentBadge}>
                <Text style={styles.installmentText}>{paidInstallments}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.bankInfo}>
            Instituição financeira: <Text style={styles.bankName}>{bankName}</Text>
          </Text>
          <Text style={styles.invoiceDescription}>
            Parcela {installmentAmount} | Vencimento {nextDueDate}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600).springify()}
          style={styles.invoiceCard}
        >
          <Text style={styles.invoiceTitle}>2° Via do boleto</Text>
          <Text style={styles.invoiceDescription}>
            Baixe seus boletos e carnês com facilidade
          </Text>

          <View style={styles.invoiceButtonWrapper}>
            <View style={styles.invoiceButtonShadow} />
            <InteractivePressable style={styles.invoiceButton} disabled={!boletoAvailable}>
              <Text style={styles.invoiceButtonText}>Acessar boleto</Text>
              <ArrowRight size={28} strokeWidth={2.4} color={colors.white} />
            </InteractivePressable>
          </View>
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
  },
  invoiceButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.white,
  },
});
