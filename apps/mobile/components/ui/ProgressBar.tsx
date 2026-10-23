import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius } from "@/theme";

interface ProgressBarProps {
  value: number;
  tone?: "primary" | "success" | "inverse";
  style?: StyleProp<ViewStyle>;
}

export default function ProgressBar({
  value,
  tone = "primary",
  style,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);

  return (
    <View
      style={[styles.track, tone === "inverse" && styles.trackInverse, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={[
          styles.fill,
          tone === "success" && styles.fillSuccess,
          tone === "inverse" && styles.fillInverse,
          { width: `${clamped * 100}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    width: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.grayLight,
    overflow: "hidden",
  },
  trackInverse: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  fillSuccess: {
    backgroundColor: colors.success,
  },
  fillInverse: {
    backgroundColor: colors.white,
  },
});
