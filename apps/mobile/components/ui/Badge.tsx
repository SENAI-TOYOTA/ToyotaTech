import { borders, radii, semantic, spacing, textStyles } from "@/theme";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface BadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Badge({ label, style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={[textStyles.badge, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: borders.thin,
    borderColor: borders.color,
    borderRadius: radii.sm,
    backgroundColor: semantic.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
  },
});
