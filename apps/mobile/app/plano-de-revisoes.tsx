import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import Badge from "@/components/ui/Badge";
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
  spacing,
  touch,
} from "@/theme";
import { documentStatusLabel } from "@/utils/document";

const vehicleCardHeight = 160;
const scheduleCardHeight = 142;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

export default function PlanoDeRevisoesScreen() {
  const router = useRouter();
  const { garage, isLoading, error, reload } = useGarage();

  useEffect(() => {
    reload();
  }, [reload]);

  const plan = garage?.documents.find(
    (document) => document.id === "maintenance-plan"
  );
  const vehicle = garage?.vehicle;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vehicle-management");
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
      <Text style={styles.headerTitle}>
        {plan ? plan.title : "Plano de revisões"}
      </Text>
    </View>
  );

  if (isLoading && !garage) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando plano de revisões"
          height={vehicleCardHeight}
          borderRadius={radii.sm}
          style={styles.vehicleCard}
        />
        <Skeleton
          height={scheduleCardHeight}
          borderRadius={radii.sm}
          style={styles.scheduleCard}
        />
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>Plano de revisões indisponível</Text>
        <Text style={styles.feedbackDescription}>
          {error ??
            "Não foi possível localizar o plano de revisões do seu veículo."}
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
        title="Veículo"
        subtitle="Dados do veículo"
        style={styles.sectionHeader}
      />

      <Card style={styles.vehicleCard}>
        <Badge
          label={documentStatusLabel(plan.status)}
          style={styles.statusBadge}
        />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{plan.date}</Text>
          </View>
          {vehicle ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Modelo</Text>
                <Text style={styles.infoValue}>{vehicle.model}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Versão</Text>
                <Text style={styles.infoValue}>{vehicle.version}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ano</Text>
                <Text style={styles.infoValue}>{vehicle.year}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Motor</Text>
                <Text style={styles.infoValue}>{vehicle.engine}</Text>
              </View>
            </>
          ) : null}
        </View>
      </Card>

      <ScreenSectionHeader
        title="Próxima revisão"
        subtitle="Quilometragem e prazos"
        style={styles.scheduleHeader}
      />

      <Card style={styles.scheduleCard}>
        <Text style={styles.notice}>
          A quilometragem atual do veículo ainda não foi informada. Sem esse
          dado, não é possível calcular a próxima revisão, os itens previstos
          nem os prazos.
        </Text>
        <Text style={styles.notice}>
          O histórico de revisões do veículo ainda não foi publicado.
        </Text>
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
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  vehicleCard: {
    marginTop: layout.sectionGap,
    minHeight: vehicleCardHeight,
  },
  statusBadge: {
    marginBottom: spacing.md,
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
  scheduleHeader: {
    marginTop: layout.sectionGap,
  },
  scheduleCard: {
    marginTop: spacing.md,
    minHeight: scheduleCardHeight,
  },
  notice: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md,
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
