import { borders, colors, fonts, fontSize, radii, spacing } from "@/theme";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface TextInputProps extends RNTextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
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
    borderWidth: borders.thin,
    borderColor: colors.black,
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
});
