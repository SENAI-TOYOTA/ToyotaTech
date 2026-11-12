import TextInput from "@/components/ui/TextInput";
import { borders, layout, radii, semantic, spacing, textStyles } from "@/theme";
import {
  StyleSheet,
  Text,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  containerStyle?: ViewStyle;
}

export default function TextField({
  label,
  error,
  containerStyle,
  ...inputProps
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={textStyles.label}>{label}</Text>
      <TextInput
        containerStyle={[styles.input, containerStyle]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  input: {
    borderWidth: borders.thin,
    borderColor: borders.color,
    borderRadius: radii.sm,
  },
  error: {
    ...textStyles.caption,
    color: semantic.error,
    maxWidth: layout.readingWidth,
  },
});
