import { borders, radii, semantic, spacing, textStyles } from "@/theme";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface BadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({ label, style }: BadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={textStyles.badge}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: borders.thin,
    borderColor: borders.color,
    borderRadius: radii.pill,
    backgroundColor: semantic.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 2,
  },
});
