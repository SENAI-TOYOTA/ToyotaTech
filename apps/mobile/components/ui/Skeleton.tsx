import { colors, radii } from "@/theme";
import { useEffect, useRef } from "react";
import {
  Animated,
  DimensionValue,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

interface SkeletonProps {
  height: number;
  width?: DimensionValue;
  borderRadius?: number;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const pulseDuration = 700;
const pulseMinOpacity = 0.45;
const pulseMaxOpacity = 0.9;

export default function Skeleton({
  height,
  width = "100%",
  borderRadius = radii.sm,
  accessibilityLabel,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(pulseMinOpacity)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: pulseMaxOpacity,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: pulseMinOpacity,
          duration: pulseDuration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      accessible={Boolean(accessibilityLabel)}
      accessibilityRole={accessibilityLabel ? "progressbar" : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={
        accessibilityLabel ? "yes" : "no-hide-descendants"
      }
      style={[
        styles.block,
        { height, width, borderRadius },
        style,
        { opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.grayLight,
  },
});
