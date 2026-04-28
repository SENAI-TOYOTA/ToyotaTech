import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from "react-native";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";

interface TextInputProps extends RNTextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function TextInput({
  icon,
  containerStyle,
  style,
  ...rest
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <RNTextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.gray}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.black,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
