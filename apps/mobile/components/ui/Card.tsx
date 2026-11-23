import { borders, radii, semantic, spacing } from "@/theme";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface CardProps {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Card({
  children,
  padding = spacing.md,
  style,
}: CardProps) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: borders.thin,
    borderColor: borders.color,
    borderRadius: radii.sm,
    backgroundColor: semantic.surface,
  },
});
