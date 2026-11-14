import { useRouter } from "expo-router";
import { ArrowLeft, Share2 } from "lucide-react-native";
import { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import { useGarage } from "@/hooks/useGarage";
import {
  borders,
  colors,
  fontSize,
  fonts,
  layout,
  radii,
  sizes,
  spacing,
  textStyles,
  touch,
} from "@/theme";
import { formatBoletoBarcode, isValidBoletoBarcode } from "@/utils/format";

const boletoCardHeight = 160;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

export default function BoletoScreen() {
  const router = useRouter();
  const { garage, isLoading, error } = useGarage();

  const [shareError, setShareError] = useState<string | null>(null);
  const financing = garage?.financing;
  const barcode = financing?.boletoBarcode ?? "";
  const hasBoleto =
    Boolean(financing?.boletoAvailable) && isValidBoletoBarcode(barcode);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/financing");
    }
  };

  const handleShare = async () => {
    setShareError(null);
    try {
      await Share.share({ message: barcode });
    } catch {
      setShareError("Não foi possível compartilhar a linha digitável.");
    }
  };

  const header = (
    <View style={styles.header}>
      <InteractivePressable
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
      >
        <ArrowLeft
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          color={colors.black}
        />
      </InteractivePressable>
      <Text style={styles.headerTitle}>Boleto</Text>
    </View>
  );

  if (isLoading && !financing) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando boleto"
          height={boletoCardHeight}
          borderRadius={radii.sm}
          style={styles.boletoCard}
        />
        <Skeleton
          height={sizes.buttonRow}
          borderRadius={radii.button}
          style={styles.shareButton}
        />
      </Screen>
    );
  }

  if (!financing || !hasBoleto) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>
          {financing ? "Boleto indisponível" : "Boleto não encontrado"}
        </Text>
        <Text style={styles.feedbackDescription}>
          {financing
            ? "A linha digitável ainda não está disponível para este contrato."
            : (error ?? "Não foi possível carregar os dados do financiamento.")}
        </Text>
        <Button
          variant="secondary"
          title="Voltar"
          onPress={handleBack}
          style={styles.feedbackButton}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "bottom"]} header={header}>
      <ScreenSectionHeader
        title="Dados do boleto"
        subtitle="Confira os dados e compartilhe a linha digitável"
        style={styles.sectionHeader}
      />

      <Card style={styles.boletoCard}>
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Banco</Text>
            <Text style={styles.infoValue}>{financing.bank}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contrato</Text>
            <Text style={styles.infoValue}>
              {financing.contractNumber ?? "Não informado"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Parcela</Text>
            <Text style={styles.infoValue}>{financing.installmentAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vencimento</Text>
            <Text style={styles.infoValue}>{financing.nextDueDate}</Text>
          </View>
        </View>

        <View style={styles.barcodeBlock}>
          <Text style={textStyles.label}>Linha digitável</Text>
          <Text
            selectable
            accessibilityLabel="Linha digitável do boleto"
            style={styles.barcode}
          >
            {formatBoletoBarcode(barcode)}
          </Text>
          <Text style={styles.barcodeHint}>
            Toque e segure para copiar a linha digitável.
          </Text>
          <Text style={styles.demoNotice}>
            Linha digitável demonstrativa, sem validade para pagamento.
          </Text>
        </View>

        <Button
          variant="primary"
          layout="row"
          title="Compartilhar"
          onPress={() => {
            void handleShare();
          }}
          icon={
            <Share2
              size={iconSize}
              strokeWidth={iconStrokeWidth}
              color={colors.white}
            />
          }
          style={styles.shareButton}
        />
        {shareError ? (
          <Text style={styles.shareError}>{shareError}</Text>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  backButton: {
    minWidth: touch.minTarget,
    minHeight: touch.minTarget,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    borderRadius: radii.sm,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  boletoCard: {
    marginTop: layout.sectionGap,
    minHeight: boletoCardHeight,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: "right",
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  barcodeBlock: {
    marginTop: spacing.lg,
  },
  barcode: {
    marginTop: spacing.xs,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    lineHeight: fontSize.xl,
    color: colors.textPrimary,
  },
  barcodeHint: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  demoNotice: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  shareButton: {
    marginTop: spacing.md,
  },
  shareError: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  feedbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  feedbackTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
    textAlign: "center",
  },
  feedbackDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  feedbackButton: {
    marginTop: spacing.sm,
  },
});
