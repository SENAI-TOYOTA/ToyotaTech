import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { isRecallCompleted, recallStatusLabel } from "@/utils/recall";

const recallDetailCardHeight = 160;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

export default function RecallDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const recallId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { garage, isLoading, error, reload } = useGarage();
  const [isSchedulingNoticeVisible, setSchedulingNoticeVisible] =
    useState(false);

  useEffect(() => {
    reload();
  }, [reload]);

  const recall = garage?.recalls.find((item) => item.id === recallId);
  const dealershipName =
    recall?.dealership ??
    garage?.order.dealership ??
    "sua concessionária Toyota";
  const chassi = garage?.chassi ?? garage?.vehicle.chassi;

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
      <Text style={styles.headerTitle}>Recall</Text>
    </View>
  );

  if (isLoading && !garage) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando detalhes do recall"
          height={recallDetailCardHeight}
          borderRadius={radii.sm}
        />
      </Screen>
    );
  }

  if (!recall) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>
          Campanha de recall indisponível
        </Text>
        <Text style={styles.feedbackText}>
          {error ?? "Não encontramos esta campanha para o seu chassi."}
        </Text>
        <Button variant="secondary" title="Voltar" onPress={handleBack} />
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "bottom"]} header={header}>
      <ScreenSectionHeader
        title="Programa de recall"
        subtitle="Detalhes da campanha e agendamento do reparo."
        style={styles.sectionHeader}
      />

      <Card style={styles.recallCard}>
        <View style={styles.badgeRow}>
          <Badge label={recallStatusLabel(recall.status)} />
          {!isRecallCompleted(recall.status) ? (
            <Text style={styles.severity}>
              {recall.severity ?? "Gravidade não informada"}
            </Text>
          ) : null}
        </View>

        <Text style={styles.recallTitle}>{recall.title}</Text>
        <Text style={styles.recallDescription}>
          {recall.description ??
            "Campanha de reparo obrigatório emitida pela Toyota do Brasil."}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Concessionária</Text>
          <Text style={styles.infoValue}>{dealershipName}</Text>
        </View>

        {isRecallCompleted(recall.status) ? (
          <Text style={styles.completedNotice}>
            Reparo executado. Nenhuma ação é necessária.
          </Text>
        ) : (
          <>
            <Button
              variant="primary"
              layout="row"
              title="Agendar reparo"
              onPress={() => setSchedulingNoticeVisible(true)}
              style={styles.actionButton}
            />
            {isSchedulingNoticeVisible ? (
              <Text style={styles.notice}>
                Agendamento online chega em breve. Procure {dealershipName} e
                informe o chassi {chassi} para executar o reparo gratuito.
              </Text>
            ) : null}
          </>
        )}
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
  recallCard: {
    marginTop: layout.sectionGap,
    minHeight: recallDetailCardHeight,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  severity: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recallTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  recallDescription: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  infoRow: {
    marginTop: spacing.md,
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
  actionButton: {
    marginTop: spacing.md,
  },
  completedNotice: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md,
    color: colors.textSecondary,
  },
  notice: {
    marginTop: spacing.sm,
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
  feedbackText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
