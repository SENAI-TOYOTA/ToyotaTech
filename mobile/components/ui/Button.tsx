import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: TouchableOpacityProps["onPress"];
}

export default function Button({
  title,
  variant = "primary",
  icon,
  style,
  textStyle,
  onPress,
}: ButtonProps) {
  if (variant === "primary") {
    return (
      <View style={[style, { marginLeft: 6, marginBottom: 6 }, styles.wrapperShadow]}>
        <View style={styles.shadowLayer} />
        <TouchableOpacity
          style={[styles.base, variantStyles[variant]]}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <View style={styles.contentWrapper}>
            <Text style={[styles.text, variantTextStyles[variant], textStyle]}>
              {title}
            </Text>
            {icon && <View style={{ flexShrink: 0 }}>{icon}</View>}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.base, variantStyles[variant], style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.contentWrapper}>
        <Text style={[styles.text, variantTextStyles[variant], textStyle]}>
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
    gap: 40,
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xxl,
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
