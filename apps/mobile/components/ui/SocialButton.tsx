import { colors } from "@/theme";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface SocialButtonProps {
  icon: ImageSourcePropType;
  style?: ViewStyle;
  size?: number;
  onPress?: () => void;
}

export default function SocialButton({
  icon,
  style,
  size = 32,
  onPress,
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
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
