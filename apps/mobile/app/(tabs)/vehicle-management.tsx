import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "@/components/ui/Button";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import Skeleton from "@/components/ui/Skeleton";
import { useGarage } from "@/hooks/useGarage";
import { colors, fonts, fontSize, spacing } from "@/theme";

const documentSkeletonIds = [
  "document-1",
  "document-2",
  "document-3",
  "document-4",
  "document-5",
  "document-6",
];

const documentDatePattern =
  /(?:\s*[-|,]\s*)?(?:\(?\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b\)?|\(?\b\d{4}[./-]\d{1,2}[./-]\d{1,2}\b\)?)/g;

function getDocumentDisplayTitle(title: string) {
  const sanitizedTitle = title
    .replace(documentDatePattern, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return sanitizedTitle || title;
}

export default function VehicleManagementScreen() {
  const { garage, isLoading } = useGarage();

  const documents = garage?.documents ?? [];
  const recalls = garage?.recalls ?? [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <ScreenSectionHeader
            title="Gestão do veículo"
            subtitle="Documentos digitais, lembretes e mais!"
            style={styles.sectionHeader}
          />
        </Animated.View>

        <View style={styles.documentList}>
          {documents.length ? (
            documents.map((document, index) => {
              const documentTitle = getDocumentDisplayTitle(document.title);

              return (
                <Animated.View
                  key={document.id}
                  entering={FadeInDown.delay(200 + index * 100)
                    .duration(600)
                    .springify()}
                >
                  <Button
                    variant="secondary"
                    layout="row"
                    title={documentTitle}
                    icon={
                      <ArrowRight
                        size={26}
                        strokeWidth={2.4}
                        color={colors.black}
                      />
                    }
                  />
                </Animated.View>
              );
            })
          ) : isLoading ? (
            documentSkeletonIds.map((documentSkeletonId, index) => (
              <Skeleton
                key={documentSkeletonId}
                height={40}
                borderRadius={0}
                accessibilityLabel={
                  index === 0 ? "Carregando documentos" : undefined
                }
              />
            ))
          ) : (
            <Text style={styles.emptyStateText}>
              Nenhum documento vinculado.
            </Text>
          )}
        </View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(600).springify()}
          style={styles.recallCard}
        >
          <Text style={styles.recallTitle}>Programas de recall</Text>
          <Text style={styles.recallDescription}>
            Notificações e agendamentos de reparos obrigatórios.
          </Text>
          <View style={styles.recallList}>
            {recalls.length ? (
              recalls.map((recall) => (
                <View key={recall.id} style={styles.recallItem}>
                  <Text style={styles.recallItemTitle}>{recall.title}</Text>
                  {recall.description ? (
                    <Text style={styles.recallItemDescription}>
                      {recall.description}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : isLoading ? (
              <Skeleton height={44} borderRadius={0} />
            ) : (
              <Text style={styles.recallEmptyText}>
                Nenhum recall registrado.
              </Text>
            )}
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
  documentList: {
    marginTop: spacing.xl + spacing.sm + 2,
    gap: spacing.xl,
  },
  emptyStateText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  recallCard: {
    marginTop: spacing.xl + spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: spacing.md - 2,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 2,
  },
  recallTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl + spacing.xs,
    color: colors.textPrimary,
  },
  recallDescription: {
    marginTop: spacing.xs - 2,
    maxWidth: 320,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md + spacing.xs,
    color: colors.textSecondary,
  },
  recallList: {
    marginTop: spacing.md + 1,
    gap: spacing.sm,
  },
  recallItem: {
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
  },
  recallItemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  recallItemDescription: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recallEmptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
