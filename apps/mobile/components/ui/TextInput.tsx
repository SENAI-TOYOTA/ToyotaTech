import { colors, fonts, fontSize, spacing } from "@/theme";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  containerStyle?: ViewStyle;
}

export default function TextInput({
  containerStyle,
  style,
  ...rest
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
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
    borderWidth: 1,
    borderColor: colors.black,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
