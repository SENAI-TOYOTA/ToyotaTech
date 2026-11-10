import { colors, fonts, fontSize } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = fontSize.logo }: LogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.toyota, { fontSize: size }]}>Toyota</Text>
      <Text style={[styles.tech, { fontSize: size }]}>Tech</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  toyota: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  tech: {
    fontFamily: fonts.semiBold,
    color: colors.black,
  },
});
