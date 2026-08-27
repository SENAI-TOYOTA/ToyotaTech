import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function InteractivePressable({
  children,
  style,
  onPress,
  ...props
}: React.ComponentProps<typeof Pressable>) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };
  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
