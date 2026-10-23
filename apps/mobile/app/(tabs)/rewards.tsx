import { Award, Gift, Lock, Ticket, TrendingUp } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormMessage from "@/components/ui/FormMessage";
import ListRow from "@/components/ui/ListRow";
import ProgressBar from "@/components/ui/ProgressBar";
import Screen, { useIsWide } from "@/components/ui/Screen";
import ScreenSectionHeader from "@/components/ui/ScreenSectionHeader";
import {
  badges,
  earnRules,
  getNextTier,
  getTier,
  rewards,
} from "@/constants/engagement";
import { redeemReward, useEngagement } from "@/hooks/useEngagement";
import { formatNumber, t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

function PointsHero({ points }: { points: number }) {
  const tier = getTier(points);
  const next = getNextTier(points);
  const progress = next
    ? (points - tier.minPoints) / (next.minPoints - tier.minPoints)
    : 1;

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroEyebrow}>{t("YOUR BALANCE")}</Text>
          <Text style={styles.heroPoints}>
            {formatNumber(points)}
            <Text style={styles.heroUnit}> {t("points")}</Text>
          </Text>
        </View>
        <View style={[styles.tierPill, { backgroundColor: tier.color }]}>
          <Award size={16} strokeWidth={2} color={colors.white} />
          <Text style={styles.tierText}>{t(tier.name)}</Text>
        </View>
      </View>
      <ProgressBar value={progress} tone="inverse" style={styles.heroBar} />
      <Text style={styles.heroCaption}>
        {next
          ? t("{points} points to reach {tier}", {
              points: formatNumber(next.minPoints - points),
              tier: t(next.name),
            })
          : t("You reached the highest level!")}
      </Text>
    </View>
  );
}

function BadgesCard() {
  return (
    <Card title="Badges" subtitle="Achievements unlocked on your journey.">
      <View style={styles.badgeGrid}>
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[styles.badge, !badge.earned && styles.badgeLocked]}
          >
            <View
              style={[
                styles.badgeIcon,
                badge.earned ? styles.badgeIconOn : styles.badgeIconOff,
              ]}
            >
              {badge.earned ? (
                <Award size={22} strokeWidth={2} color={colors.white} />
              ) : (
                <Lock size={18} strokeWidth={2} color={colors.textMuted} />
              )}
            </View>
            <Text style={styles.badgeTitle}>{t(badge.title)}</Text>
            <Text style={styles.badgeText}>{t(badge.description)}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function RewardsCard({ points }: { points: number }) {
  const [message, setMessage] = useState<string | null>(null);
  const { redemptions } = useEngagement();

  return (
    <Card title="Rewards" subtitle="Exchange your points for benefits.">
      <View style={styles.rewardList}>
        {rewards.map((reward) => {
          const canRedeem = points >= reward.cost;
          return (
            <View key={reward.id} style={styles.reward}>
              <View style={styles.rewardIcon}>
                <Gift size={20} strokeWidth={1.8} color={colors.primary} />
              </View>
              <View style={styles.rewardText}>
                <Text style={styles.rewardTitle}>{t(reward.title)}</Text>
                <Text style={styles.rewardDescription}>
                  {t(reward.description)}
                </Text>
                <Text style={styles.rewardCost}>
                  {t("{points} points", { points: formatNumber(reward.cost) })}
                </Text>
              </View>
              <Button
                title="Redeem"
                size="md"
                variant={canRedeem ? "primary" : "outline"}
                disabled={!canRedeem}
                style={styles.redeemButton}
                onPress={() => {
                  const result = redeemReward(reward);
                  if (result) {
                    setMessage(
                      t(
                        "Reward redeemed! Show code {code} at the dealership.",
                        {
                          code: result.code,
                        }
                      )
                    );
                  }
                }}
              />
            </View>
          );
        })}
      </View>
      <FormMessage message={message} tone="success" style={styles.message} />
      {redemptions.length ? (
        <View style={styles.redeemed}>
          <Text style={styles.redeemedTitle}>{t("My vouchers")}</Text>
          {redemptions.map((item) => (
            <ListRow
              key={item.id}
              icon={Ticket}
              iconTone="success"
              title={item.reward.title}
              subtitle={t("Code {code}", { code: item.code })}
              trailing={<Badge label="Available" tone="success" />}
            />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

function HowToEarnCard() {
  return (
    <Card
      title="How to earn points"
      subtitle="Every action with Toyota adds up."
      padded={false}
    >
      {earnRules.map((rule, index) => (
        <ListRow
          key={rule.id}
          icon={TrendingUp}
          iconTone="primary"
          title={rule.title}
          subtitle={rule.description}
          showDivider={index > 0}
          trailing={<Text style={styles.earnPoints}>{rule.points}</Text>}
        />
      ))}
    </Card>
  );
}

export default function RewardsScreen() {
  const isWide = useIsWide();
  const { points } = useEngagement();

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(400)}>
        <ScreenSectionHeader
          eyebrow="TOYOTA REWARDS"
          title="Points and rewards"
          subtitle="Earn points with every service and exchange them for benefits."
        />
      </Animated.View>

      <PointsHero points={points} />

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <RewardsCard points={points} />
        </View>
        <View style={[styles.column, isWide && styles.columnWide]}>
          <HowToEarnCard />
          <BadgesCard />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.ink,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  heroEyebrow: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: colors.primary,
  },
  heroPoints: {
    marginTop: spacing.xs,
    fontFamily: fonts.bold,
    fontSize: fontSize.display + 8,
    color: colors.white,
  },
  heroUnit: {
    fontFamily: fonts.medium,
    fontSize: fontSize.lg,
    color: colors.textInverseMuted,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tierText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  heroBar: {
    marginTop: spacing.lg - 4,
  },
  heroCaption: {
    marginTop: spacing.sm,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textInverseMuted,
  },
  columns: {
    gap: spacing.lg - 4,
  },
  columnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  column: {
    gap: spacing.lg - 4,
  },
  columnWide: {
    flex: 1,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm + 2,
  },
  badge: {
    flexGrow: 1,
    flexBasis: 140,
    alignItems: "center",
    padding: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconOn: {
    backgroundColor: colors.primary,
  },
  badgeIconOff: {
    backgroundColor: colors.grayLight,
  },
  badgeTitle: {
    marginTop: spacing.sm,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: "center",
  },
  badgeText: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm - 1,
    color: colors.textSecondary,
    textAlign: "center",
  },
  rewardList: {
    gap: spacing.md - 4,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    padding: spacing.md - 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardText: {
    flex: 1,
  },
  rewardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  rewardDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rewardCost: {
    marginTop: 2,
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  redeemButton: {
    width: "auto",
  },
  message: {
    marginTop: spacing.md - 4,
  },
  redeemed: {
    marginTop: spacing.md,
    marginHorizontal: -(spacing.lg - 4),
  },
  redeemedTitle: {
    paddingHorizontal: spacing.lg - 4,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  earnPoints: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm + 1,
    color: colors.success,
  },
});
