import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import Skeleton from "@/components/ui/Skeleton";
import TextField from "@/components/ui/TextField";
import { useHighlights } from "@/hooks/useHighlights";
import {
  borders,
  colors,
  fontSize,
  fonts,
  layout,
  radii,
  semantic,
  spacing,
  touch,
} from "@/theme";
import { highlightImageSource } from "@/utils/highlight";

const listingImageSize = 72;
const listingCardHeight =
  listingImageSize + 2 * (spacing.sm + 2) + 2 * borders.thin;
const listingSkeletonCount = 4;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

const listingImages: Record<string, ImageSourcePropType> = {
  "corolla-main": require("@/assets/images/corolla-main.jpg"),
  "corolla-side": require("@/assets/images/corolla-side.jpg"),
  "corolla-news": require("@/assets/images/corolla-news.jpg"),
  "yaris-cross": require("@/assets/images/yaris-cross.jpg"),
};
const fallbackImage = listingImages["corolla-news"];

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ContentListingScreen() {
  const router = useRouter();
  const { highlights, isLoading, error, reload } = useHighlights();
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeTerm(query);
  const filteredHighlights = normalizedQuery
    ? highlights.filter((highlight) =>
        normalizeTerm(highlight.title).includes(normalizedQuery)
      )
    : highlights;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
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
      <Text style={styles.headerTitle}>Guias e Notícias</Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading && !highlights.length) {
      return (
        <View style={styles.list}>
          {Array.from({ length: listingSkeletonCount }, (_, index) => (
            <Skeleton
              key={`listing-skeleton-${index}`}
              height={listingCardHeight}
              accessibilityLabel={
                index === 0 ? "Carregando guias e notícias" : undefined
              }
            />
          ))}
        </View>
      );
    }

    if (error && !highlights.length) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>{error}</Text>
          <Button
            variant="outline"
            title="Tentar novamente"
            onPress={reload}
            style={styles.feedbackButton}
          />
        </View>
      );
    }

    if (!highlights.length) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            Nenhum guia ou notícia disponível.
          </Text>
        </View>
      );
    }

    if (!filteredHighlights.length) {
      return (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            {`Nenhum resultado para "${query.trim()}".`}
          </Text>
          <Button
            variant="outline"
            title="Limpar busca"
            onPress={() => setQuery("")}
            style={styles.feedbackButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {filteredHighlights.map((highlight) => (
          <Card key={highlight.id} padding={0} style={styles.card}>
            <InteractivePressable
              style={styles.cardContent}
              onPress={() =>
                router.push({
                  pathname: "/content/[id]",
                  params: { id: highlight.id },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={highlight.title}
            >
              <Image
                source={highlightImageSource(
                  highlight,
                  listingImages,
                  fallbackImage
                )}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle} numberOfLines={2}>
                {highlight.title}
              </Text>
            </InteractivePressable>
          </Card>
        ))}
      </View>
    );
  };

  return (
    <Screen
      edges={["top", "bottom"]}
      header={header}
      refreshing={isLoading && highlights.length > 0}
      onRefresh={reload}
    >
      <View style={styles.searchField}>
        <TextField
          label="Buscar"
          placeholder="Título do guia ou notícia"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {error && highlights.length ? (
        <Text style={styles.inlineError}>{error}</Text>
      ) : null}
      {renderContent()}
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
  searchField: {
    marginTop: spacing.lg,
    maxWidth: layout.readingWidth,
  },
  inlineError: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: semantic.error,
  },
  list: {
    marginTop: spacing.lg,
    gap: spacing.sm + 2,
  },
  card: {
    minHeight: listingCardHeight,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    padding: spacing.sm + 2,
  },
  thumbnail: {
    width: listingImageSize,
    height: listingImageSize,
    borderRadius: radii.sm,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  feedback: {
    marginTop: spacing.lg,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  feedbackText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  feedbackButton: {
    marginTop: spacing.xs,
  },
});
