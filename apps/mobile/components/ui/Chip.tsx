import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface ChipProps {
  label: string;
  caption?: string;
  selected?: boolean;
  onPress?: () => void;
}

export default function Chip({
  label,
  caption,
  selected = false,
  onPress,
}: ChipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.chip,
        Boolean(caption) && styles.chipStacked,
        isHovered && !selected && styles.hovered,
        selected && styles.selected,
      ]}
    >
      {caption ? (
        <Text style={[styles.caption, selected && styles.textSelected]}>
          {t(caption)}
        </Text>
      ) : null}
      <Text style={[styles.label, selected && styles.textSelected]}>
        {t(label)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md - 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chipStacked: {
    minWidth: 64,
  },
  hovered: {
    backgroundColor: colors.surfaceMuted,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  caption: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm + 1,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.white,
  },
});
