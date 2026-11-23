import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import Skeleton from "@/components/ui/Skeleton";
import { apiErrorMessage } from "@/services/api";
import { fetchContentDetail } from "@/services/content";
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
import { ContentDetail } from "@/types/content";
import { highlightImageSource } from "@/utils/highlight";

const coverHeight = 180;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;

const detailImages: Record<string, ImageSourcePropType> = {
  "corolla-main": require("@/assets/images/corolla-main.jpg"),
  "corolla-side": require("@/assets/images/corolla-side.jpg"),
  "corolla-news": require("@/assets/images/corolla-news.jpg"),
  "yaris-cross": require("@/assets/images/yaris-cross.jpg"),
};
const fallbackImage = detailImages["corolla-news"];

interface DetailState {
  content: ContentDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DetailState = {
  content: null,
  isLoading: true,
  error: null,
};

export default function ContentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const contentId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [state, setState] = useState<DetailState>(initialState);

  const load = useCallback(async () => {
    if (!contentId) {
      setState({
        content: null,
        isLoading: false,
        error: "Conteúdo não encontrado.",
      });
      return;
    }

    setState(initialState);
    try {
      const response = await fetchContentDetail(contentId);
      setState({ content: response.content, isLoading: false, error: null });
    } catch (error) {
      setState({
        content: null,
        isLoading: false,
        error: apiErrorMessage(error, "Não foi possível carregar o conteúdo."),
      });
    }
  }, [contentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const headerTitle =
    state.content?.category === "guide"
      ? "Guia"
      : state.content?.category === "news"
        ? "Notícia"
        : "Novidade";

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
      <Text style={styles.headerTitle}>{headerTitle}</Text>
    </View>
  );

  if (state.isLoading) {
    return (
      <Screen edges={["top", "bottom"]} header={header}>
        <Skeleton
          accessibilityLabel="Carregando conteúdo"
          height={coverHeight}
          borderRadius={radii.sm}
          style={styles.cover}
        />
      </Screen>
    );
  }

  if (!state.content) {
    return (
      <Screen
        edges={["top", "bottom"]}
        header={header}
        scroll={false}
        contentStyle={styles.feedbackContainer}
      >
        <Text style={styles.feedbackTitle}>Conteúdo indisponível</Text>
        <Text style={styles.feedbackDescription}>
          {state.error ?? "Não foi possível carregar o conteúdo."}
        </Text>
        <Button
          variant="primary"
          title="Tentar novamente"
          onPress={() => {
            void load();
          }}
          style={styles.feedbackButton}
        />
        <Button variant="secondary" title="Voltar" onPress={handleBack} />
      </Screen>
    );
  }

  const content = state.content;
  const categoryLabel =
    content.category === "guide"
      ? "GUIA"
      : content.category === "news"
        ? "NOTÍCIA"
        : null;
  const metaParts = [
    content.author,
    content.publishedAt,
    content.readingTime ? `${content.readingTime} min de leitura` : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <Screen edges={["top", "bottom"]} header={header}>
      <Image
        source={highlightImageSource(content, detailImages, fallbackImage)}
        style={styles.cover}
        resizeMode="cover"
      />
      {categoryLabel ? (
        <Badge label={categoryLabel} style={styles.categoryBadge} />
      ) : null}
      <Text style={styles.title}>{content.title}</Text>
      {metaParts.length ? (
        <Text style={styles.meta}>{metaParts.join(" · ")}</Text>
      ) : null}
      {content.summary ? (
        <Text style={styles.summary}>{content.summary}</Text>
      ) : null}
      <View style={styles.body}>
        {content.body.length ? (
          content.body.map((paragraph, index) => (
            <Text key={`paragraph-${index}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))
        ) : (
          <Text style={styles.paragraph}>Conteúdo em preparação.</Text>
        )}
      </View>
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
  cover: {
    marginTop: spacing.lg,
    width: "100%",
    height: coverHeight,
    borderRadius: radii.sm,
    backgroundColor: colors.grayLight,
  },
  categoryBadge: {
    marginTop: spacing.md,
  },
  title: {
    marginTop: spacing.sm,
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.black,
  },
  meta: {
    marginTop: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summary: {
    marginTop: spacing.md,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    lineHeight: fontSize.xxl,
    color: colors.textPrimary,
  },
  body: {
    marginTop: spacing.lg,
    gap: spacing.md,
    maxWidth: layout.readingWidth,
  },
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.xl,
    color: colors.textPrimary,
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
