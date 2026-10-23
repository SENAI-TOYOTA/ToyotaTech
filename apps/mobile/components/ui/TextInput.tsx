import { ReactNode, useState } from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { t } from "@/i18n";
import { colors, fonts, fontSize, radius, spacing } from "@/theme";

interface TextInputProps extends RNTextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  rightAccessory?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function TextInput({
  label,
  hint,
  error,
  rightAccessory,
  containerStyle,
  style,
  editable = true,
  placeholder,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{t(label)}</Text> : null}
      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
          !editable && styles.fieldReadOnly,
        ]}
      >
        <RNTextInput
          style={[styles.input, !editable && styles.inputReadOnly, style]}
          placeholderTextColor={colors.textMuted}
          placeholder={t(placeholder)}
          editable={editable}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />
        {rightAccessory ? (
          <View style={styles.accessory}>{rightAccessory}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{t(error)}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{t(hint)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 6,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  field: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: {
    borderColor: colors.ink,
    boxShadow: "0px 0px 0px 3px rgba(16, 20, 24, 0.08)",
  },
  fieldError: {
    borderColor: colors.primary,
  },
  fieldReadOnly: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: fontSize.md + 1,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  inputReadOnly: {
    color: colors.textSecondary,
  },
  accessory: {
    marginLeft: spacing.sm,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm - 1,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm - 1,
    lineHeight: 18,
    color: colors.primary,
  },
});
