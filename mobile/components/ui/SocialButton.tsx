import { TouchableOpacity, StyleSheet, Image, ImageSourcePropType, ViewStyle, View } from "react-native";
import { colors, borderRadius, spacing } from "@/constants/theme";

interface SocialButtonProps {
  icon: ImageSourcePropType;
  style?: ViewStyle;
  size?: number;
}

export default function SocialButton({
  icon,
  style,
  size = 32,
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <Image
        source={icon}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
