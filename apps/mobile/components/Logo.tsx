import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSize } from "@/theme";

interface LogoProps {
  size?: number;
  inverse?: boolean;
}

export default function Logo({ size = fontSize.logo, inverse }: LogoProps) {
  return (
    <View
      style={styles.container}
      accessibilityRole="image"
      accessibilityLabel="ToyotaTech"
    >
      <Text style={[styles.toyota, { fontSize: size, lineHeight: size * 1.1 }]}>
        Toyota
      </Text>
      <Text
        style={[
          styles.tech,
          { fontSize: size, lineHeight: size * 1.1 },
          inverse && styles.techInverse,
        ]}
      >
        Tech
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  toyota: {
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tech: {
    fontFamily: fonts.bold,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  techInverse: {
    color: colors.white,
  },
});
