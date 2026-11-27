import { useRouter } from "expo-router";
import { ArrowLeft, ArrowUpDown } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import InteractivePressable from "@/components/ui/InteractivePressable";
import Screen from "@/components/ui/Screen";
import Skeleton from "@/components/ui/Skeleton";
import TextField from "@/components/ui/TextField";
import {
  CONTENT_PAGE_SIZE,
  useContentListing,
} from "@/hooks/useContentListing";
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
import type { ContentSort, ContentType } from "@/types/content";
import {
  highlightFallbackImage,
  highlightImageSource,
  highlightImages,
} from "@/utils/highlight";

const listingImageSize = 72;
const listingCardHeight =
  listingImageSize + 2 * (spacing.sm + 2) + 2 * borders.thin;
const iconSize = fontSize.lg;
const iconStrokeWidth = borders.strong;
const searchDebounceMs = 400;
const filterChipHitSlop = {
  top: 6,
  bottom: 6,
  left: 4,
  right: 4,
};
const typeFilters: { value: "all" | ContentType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "guide", label: "Guias" },
  { value: "news", label: "Notícias" },
];

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <InteractivePressable
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      hitSlop={filterChipHitSlop}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.filterChipText,
          selected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </InteractivePressable>
  );
}

export default function ContentListingScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ContentType>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<ContentSort>("recent");

  const {
    highlights,
    categories,
    total,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    reload,
    loadMore,
  } = useContentListing({
    type: typeFilter === "all" ? undefined : typeFilter,
    category: category ?? undefined,
    query: debouncedQuery || undefined,
    sort,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, searchDebounceMs);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (category && categories.length && !categories.includes(category)) {
      setCategory(null);
    }
  }, [categories, category]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    typeFilter !== "all" ||
    category !== null ||
    sort !== "recent";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setTypeFilter("all");
    setCategory(null);
    setSort("recent");
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
          {Array.from({ length: CONTENT_PAGE_SIZE }, (_, index) => (
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
            {hasActiveFilters
              ? "Nenhum resultado para os filtros selecionados."
              : "Nenhum guia ou notícia disponível."}
          </Text>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              title="Limpar filtros"
              onPress={handleClearFilters}
              style={styles.feedbackButton}
            />
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.list}>
        {highlights.map((highlight) => (
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
                  highlightImages,
                  highlightFallbackImage
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
        {hasMore ? (
          <InteractivePressable
            style={styles.loadMore}
            onPress={loadMore}
            disabled={isLoadingMore}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoadingMore }}
            accessibilityLabel="Carregar mais"
          >
            {isLoadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
            <Text style={styles.loadMoreText}>
              {isLoadingMore ? "Carregando..." : "Carregar mais"}
            </Text>
          </InteractivePressable>
        ) : null}
      </View>
    );
  };

  return (
    <Screen
      edges={["top", "bottom"]}
      header={header}
      refreshing={isRefreshing}
      onRefresh={reload}
      onEndReached={loadMore}
    >
      <View style={styles.searchField}>
        <TextField
          label="Buscar"
          placeholder="Título ou resumo do guia ou notícia"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {typeFilters.map((filter) => (
          <FilterChip
            key={filter.value}
            label={filter.label}
            selected={typeFilter === filter.value}
            onPress={() => setTypeFilter(filter.value)}
          />
        ))}
        <InteractivePressable
          style={styles.sortChip}
          hitSlop={filterChipHitSlop}
          onPress={() =>
            setSort((current) => (current === "recent" ? "oldest" : "recent"))
          }
          accessibilityRole="button"
          accessibilityLabel={
            sort === "recent" ? "Mais recentes" : "Mais antigos"
          }
        >
          <ArrowUpDown
            size={fontSize.sm}
            strokeWidth={iconStrokeWidth}
            color={colors.black}
          />
          <Text style={styles.sortChipText}>
            {sort === "recent" ? "Mais recentes" : "Mais antigos"}
          </Text>
        </InteractivePressable>
      </ScrollView>
      {categories.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          <FilterChip
            label="Todas"
            selected={category === null}
            onPress={() => setCategory(null)}
          />
          {categories.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
      ) : null}
      {!isLoading && !error ? (
        <Text style={styles.resultsText}>
          {`${total} ${total === 1 ? "resultado" : "resultados"}`}
        </Text>
      ) : null}
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
  filterScroll: {
    marginTop: spacing.md,
  },
  filterRow: {
    gap: spacing.sm,
  },
  filterChip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  sortChip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sortChipText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  resultsText: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  inlineError: {
    marginTop: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: semantic.error,
  },
  list: {
    marginTop: spacing.md,
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
  loadMore: {
    minHeight: touch.minTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  loadMoreText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
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
