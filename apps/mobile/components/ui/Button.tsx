import {
  borders,
  colors,
  elevation,
  fonts,
  fontSize,
  radii,
  sizes,
  spacing,
  touch,
} from "@/theme";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonLayout = "cta" | "row";

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  layout?: ButtonLayout;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onPress?: TouchableOpacityProps["onPress"];
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  variant = "primary",
  layout = "cta",
  icon,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { width } = useWindowDimensions();
  const isCompactScreen = width <= 390;
  const pressProgress = useRef(new Animated.Value(0)).current;
  const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

  const isRow = layout === "row";
  const isInactive = disabled || loading;
  const hasPressFeedback = !isInactive;
  const hasShadow = variant !== "outline";

  const animatePress = (toValue: number) => {
    Animated.timing(pressProgress, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const renderSurface = (surfaceStyle?: StyleProp<ViewStyle>) => (
    <AnimatedTouchableOpacity
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isInactive }}
      activeOpacity={1}
      hitSlop={
        isRow
          ? {
              top: (touch.minTarget - sizes.buttonRow) / 2,
              bottom: (touch.minTarget - sizes.buttonRow) / 2,
            }
          : undefined
      }
      disabled={isInactive}
      style={[
        styles.base,
        isRow && styles.baseRow,
        variantStyles[variant],
        isInactive && disabledSurfaceStyles[variant],
        hasShadow && {
          transform: [
            {
              translateX: pressProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -6],
              }),
            },
            {
              translateY: pressProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 6],
              }),
            },
          ],
        },
        surfaceStyle,
      ]}
      onPressIn={() => {
        if (hasPressFeedback) {
          animatePress(1);
        }
      }}
      onPressOut={() => {
        if (hasPressFeedback) {
          animatePress(0);
        }
      }}
      onPress={onPress}
    >
      <View style={[styles.contentWrapper, isRow && styles.contentWrapperRow]}>
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            isRow && styles.textRow,
            variantTextStyles[variant],
            !isRow && isCompactScreen && styles.textCompact,
            textStyle,
            isInactive && styles.textInactive,
          ]}
        >
          {title}
        </Text>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? colors.white : colors.black}
          />
        ) : (
          icon
        )}
      </View>
    </AnimatedTouchableOpacity>
  );

  if (!hasShadow) {
    return renderSurface(style);
  }

  return (
    <View style={[styles.wrapper, isRow && styles.wrapperRow, style]}>
      <View
        style={[styles.shadowLayer, isInactive && styles.shadowLayerInactive]}
      />
      {renderSurface()}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: elevation.offset,
    marginBottom: elevation.offset,
  },
  wrapperRow: {
    height: sizes.buttonRow,
  },
  shadowLayer: {
    position: "absolute",
    top: elevation.offset,
    left: -elevation.offset,
    right: elevation.offset,
    bottom: -elevation.offset,
    backgroundColor: colors.white,
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
  },
  shadowLayerInactive: {
    borderColor: colors.grayLight,
  },
  base: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
  },
  baseRow: {
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: spacing.sm + 6,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    minWidth: 0,
  },
  contentWrapperRow: {
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xxl,
    flexShrink: 1,
  },
  textRow: {
    flex: 1,
    fontSize: fontSize.xl,
  },
  textCompact: {
    fontSize: 28,
  },
  textInactive: {
    color: colors.gray,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
    borderWidth: borders.thin,
    borderColor: colors.black,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: borders.thin,
    borderColor: colors.black,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.white,
  },
  secondary: {
    color: colors.textPrimary,
  },
  outline: {
    color: colors.textPrimary,
  },
};

const disabledSurfaceStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.grayLight,
    borderColor: colors.grayLight,
  },
  secondary: {
    backgroundColor: colors.grayLight,
    borderColor: colors.gray,
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.gray,
  },
};
