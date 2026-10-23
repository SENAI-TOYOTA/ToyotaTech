import { Clock, ExternalLink, Play } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import WebEmbed from "@/components/ui/WebEmbed";
import { NewsVideo, newsVideos } from "@/constants/engagement";
import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, shadows, spacing } from "@/theme";

const thumbnails = [
  require("@/assets/images/corolla-main.png"),
  require("@/assets/images/corolla-side.png"),
  require("@/assets/images/corolla-news.png"),
];

function openVideo(video: NewsVideo) {
  const url = video.youtubeId
    ? `https://www.youtube.com/watch?v=${video.youtubeId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`;
  void Linking.openURL(url);
}

function FeaturedVideo({ video, index }: { video: NewsVideo; index: number }) {
  return (
    <View style={styles.featured}>
      {video.youtubeId ? (
        <WebEmbed
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
          title={t(video.title)}
          style={styles.player}
        />
      ) : (
        <Pressable
          style={styles.player}
          onPress={() => openVideo(video)}
          accessibilityRole="button"
          accessibilityLabel={t("Watch video")}
        >
          <Image
            source={thumbnails[index % thumbnails.length]}
            style={styles.playerImage}
            resizeMode="cover"
          />
          <View style={styles.playerShade} />
          <View style={styles.playButton}>
            <Play
              size={30}
              strokeWidth={2}
              color={colors.white}
              fill={colors.white}
            />
          </View>
        </Pressable>
      )}
      <View style={styles.featuredBody}>
        <Badge label={video.category} tone="primary" />
        <Text style={styles.featuredTitle}>{t(video.title)}</Text>
        <Text style={styles.featuredText}>{t(video.description)}</Text>
        <View style={styles.meta}>
          <Clock size={14} strokeWidth={2} color={colors.textMuted} />
          <Text style={styles.metaText}>{video.duration}</Text>
        </View>
        <Button
          title="Watch on YouTube"
          size="md"
          variant="secondary"
          iconPosition="left"
          icon={<ExternalLink size={16} strokeWidth={2} color={colors.white} />}
          style={styles.watch}
          onPress={() => openVideo(video)}
        />
      </View>
    </View>
  );
}

export default function NewsScreen() {
  const isWide = useIsWide();
  const [selected, setSelected] = useState(0);
  const video = newsVideos[selected];

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="NEWS"
          title="News and videos"
          subtitle="See how your Toyota is made, inspected and delivered."
        />
      </Animated.View>

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={isWide ? styles.mainWide : undefined}>
          <FeaturedVideo video={video} index={selected} />
        </View>
        <View style={[styles.list, isWide && styles.listWide]}>
          <Text style={styles.listTitle}>{t("All videos")}</Text>
          {newsVideos.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => setSelected(index)}
              accessibilityRole="button"
              style={[styles.item, index === selected && styles.itemActive]}
            >
              <View style={styles.itemThumb}>
                <Image
                  source={thumbnails[index % thumbnails.length]}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemPlay}>
                  <Play
                    size={14}
                    strokeWidth={2}
                    color={colors.white}
                    fill={colors.white}
                  />
                </View>
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemCategory}>{t(item.category)}</Text>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {t(item.title)}
                </Text>
                <Text style={styles.metaText}>{item.duration}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mainWide: {
    flex: 1,
  },
  featured: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  player: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.ink,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  playerShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 20, 24, 0.35)",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  featuredBody: {
    padding: spacing.lg - 4,
  },
  featuredTitle: {
    marginTop: spacing.sm + 2,
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  featuredText: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  meta: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm - 1,
    color: colors.textMuted,
  },
  watch: {
    marginTop: spacing.md,
    alignSelf: "flex-start",
    width: "auto",
  },
  list: {
    gap: spacing.sm,
  },
  listWide: {
    width: 360,
  },
  listTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  item: {
    flexDirection: "row",
    gap: spacing.md - 4,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  itemThumb: {
    width: 112,
    height: 64,
    borderRadius: radius.sm,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  itemImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  itemPlay: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16, 20, 24, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flex: 1,
  },
  itemCategory: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: colors.primary,
    textTransform: "uppercase",
  },
  itemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
});
