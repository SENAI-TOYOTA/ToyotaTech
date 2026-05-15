import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  useWindowDimensions,
} from "react-native";
import { useRef } from "react";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: TouchableOpacityProps["onPress"];
  disabled?: boolean;
}

export default function Button({
  title,
  variant = "primary",
  icon,
  style,
  textStyle,
  onPress,
  disabled = false,
}: ButtonProps) {
  const { width } = useWindowDimensions();
  const isCompactScreen = width <= 390;
  const pressProgress = useRef(new Animated.Value(0)).current;
  const AnimatedTouchableOpacity =
    Animated.createAnimatedComponent(TouchableOpacity);

  const animatePress = (toValue: number) => {
    Animated.timing(pressProgress, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  if (variant === "primary") {
    return (
      <View style={[style, { marginLeft: 6, marginBottom: 6 }, styles.wrapperShadow]}>
        <View style={styles.shadowLayer} />
        <AnimatedTouchableOpacity
          style={[
            styles.base,
            variantStyles[variant],
            disabled && styles.disabled,
            {
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
          ]}
          activeOpacity={1}
          onPressIn={() => {
            if (!disabled) {
              animatePress(1);
            }
          }}
          onPressOut={() => {
            if (!disabled) {
              animatePress(0);
            }
          }}
          onPress={disabled ? undefined : onPress}
        >
          <View
            style={[
              styles.contentWrapper,
              isCompactScreen && styles.contentWrapperCompact,
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.text,
                variantTextStyles[variant],
                isCompactScreen && styles.textCompact,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && <View style={{ flexShrink: 0 }}>{icon}</View>}
          </View>
        </AnimatedTouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.base, variantStyles[variant], disabled && styles.disabled, style]}
      activeOpacity={1}
      onPress={disabled ? undefined : onPress}
    >
      <View
        style={[
          styles.contentWrapper,
          isCompactScreen && styles.contentWrapperCompact,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            variantTextStyles[variant],
            isCompactScreen && styles.textCompact,
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && <View style={{ flexShrink: 0 }}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: 2,
    width: "100%",
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    minWidth: 0,
  },
  contentWrapperCompact: {
    gap: spacing.md,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xxl,
    flexShrink: 1,
  },
  textCompact: {
    fontSize: 28,
  },
  shadowLayer: {
    position: "absolute",
    top: 6,
    left: -6,
    right: 6,
    bottom: -6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 2,
  },
  wrapperShadow: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.black,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.white,
  },
  outline: {
    color: colors.textPrimary,
  },
  ghost: {
    color: colors.textPrimary,
  },
};
