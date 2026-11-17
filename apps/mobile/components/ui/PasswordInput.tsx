import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import TextInput from "@/components/ui/TextInput";
import { t } from "@/i18n";
import { colors, radius } from "@/theme";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof TextInput>,
  "secureTextEntry" | "rightAccessory"
>;

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!isVisible}
      rightAccessory={
        <Pressable
          onPress={() => setIsVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={t(isVisible ? "Hide password" : "Show password")}
          hitSlop={8}
          style={({ pressed }) => [
            styles.toggle,
            pressed && styles.togglePressed,
          ]}
        >
          <Icon size={20} strokeWidth={1.8} color={colors.textSecondary} />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  togglePressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
