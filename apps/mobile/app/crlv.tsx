import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";

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
import { canOpenDocument, documentStatusLabel } from "@/utils/document";

const crlvCardHeight = 160;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

export default function CrlvScreen() {
  const router = useRouter();
  const { garage, isLoading, error, reload } = useGarage();
  const [openError, setOpenError] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, [reload]);

  const crlv = garage?.documents.find((document) => document.id === "crlv");
  const vehicle = garage?.vehicle;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/vehicle-management");
    }
  };

  const handleOpen = async () => {
    if (!crlv?.url) {
      return;
    }

    setOpenError(null);
    try {
      await Linking.openURL(crlv.url);
    } catch {
      setOpenError("Não foi possível abrir o documento.");
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
      <Text style={styles.headerTitle}>CRLV-e</Text>
    </View>
  );

  if (isLoading && !garage) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando CRLV-e"
          height={crlvCardHeight}
          borderRadius={radii.sm}
          style={styles.crlvCard}
        />
      </Screen>
    );
  }

  if (!crlv) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>CRLV-e indisponível</Text>
        <Text style={styles.feedbackDescription}>
          {error ?? "Não foi possível localizar o documento deste veículo."}
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

  const canOpen = canOpenDocument(crlv);

  return (
    <Screen edges={["top", "bottom"]} header={header}>
      <ScreenSectionHeader
        title="CRLV-e"
        subtitle="Documento digital do veículo"
        style={styles.sectionHeader}
      />

      <Card style={styles.crlvCard}>
        <Badge
          label={documentStatusLabel(crlv.status)}
          style={styles.statusBadge}
        />

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emissão</Text>
            <Text style={styles.infoValue}>{crlv.date}</Text>
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
                <Text style={styles.infoLabel}>Cor</Text>
                <Text style={styles.infoValue}>{vehicle.color}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Chassi</Text>
                <Text style={styles.infoValue}>{vehicle.chassi}</Text>
              </View>
            </>
          ) : null}
        </View>

        {crlv.status === "pending" ? (
          <Text style={styles.notice}>
            O CRLV-e está em processamento. A visualização será liberada quando
            o documento estiver disponível.
          </Text>
        ) : canOpen ? (
          <>
            <Button
              variant="primary"
              layout="row"
              title="Visualizar documento"
              loading={isLoading}
              onPress={() => {
                void handleOpen();
              }}
              style={styles.actionButton}
            />
            {openError ? <Text style={styles.notice}>{openError}</Text> : null}
          </>
        ) : (
          <Text style={styles.notice}>
            A versão digital deste documento não está disponível neste ambiente.
          </Text>
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
  crlvCard: {
    marginTop: layout.sectionGap,
    minHeight: crlvCardHeight,
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
  actionButton: {
    marginTop: spacing.md,
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
