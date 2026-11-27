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

const manualCardHeight = 160;
const chaptersCardHeight = 142;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

export default function ManualDoVeiculoScreen() {
  const router = useRouter();
  const { garage, isLoading, error, reload } = useGarage();

  useEffect(() => {
    reload();
  }, [reload]);

  const manual = garage?.documents.find((document) => document.id === "manual");
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
      <Text style={styles.headerTitle}>{manual ? manual.title : "Manual"}</Text>
    </View>
  );

  if (isLoading && !garage) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando manual"
          height={manualCardHeight}
          borderRadius={radii.sm}
          style={styles.documentCard}
        />
        <Skeleton
          height={chaptersCardHeight}
          borderRadius={radii.sm}
          style={styles.chaptersCard}
        />
      </Screen>
    );
  }

  if (!manual) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>Manual indisponível</Text>
        <Text style={styles.feedbackDescription}>
          {error ?? "Não foi possível localizar o manual deste veículo."}
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
        title={manual.title}
        subtitle="Manual do proprietário do seu veículo"
        style={styles.sectionHeader}
      />

      <Card style={styles.documentCard}>
        <Badge
          label={documentStatusLabel(manual.status)}
          style={styles.statusBadge}
        />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data do documento</Text>
            <Text style={styles.infoValue}>{manual.date}</Text>
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

        {manual.status === "pending" ? (
          <Text style={styles.notice}>
            O manual está em processamento. A visualização será liberada quando
            o documento estiver disponível.
          </Text>
        ) : (
          <Text style={styles.notice}>
            A versão digital deste manual não está disponível neste ambiente.
          </Text>
        )}
      </Card>

      <ScreenSectionHeader
        title="Capítulos e busca"
        subtitle="Conteúdo por assunto do seu manual"
        style={styles.chaptersHeader}
      />

      <Card style={styles.chaptersCard}>
        <Text style={styles.notice}>
          Os capítulos e a busca por assunto ainda não estão disponíveis neste
          ambiente. O índice e a busca serão exibidos quando o conteúdo do
          manual for publicado para o modelo e a versão do seu veículo.
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
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  sectionHeader: {
    marginTop: spacing.lg,
  },
  documentCard: {
    marginTop: layout.sectionGap,
    minHeight: manualCardHeight,
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
  notice: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.md,
    color: colors.textSecondary,
  },
  chaptersHeader: {
    marginTop: layout.sectionGap,
  },
  chaptersCard: {
    marginTop: spacing.md,
    minHeight: chaptersCardHeight,
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
