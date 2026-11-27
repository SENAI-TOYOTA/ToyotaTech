import InteractivePressable from "@/components/ui/InteractivePressable";
import TextInput from "@/components/ui/TextInput";
import {
  borders,
  colors,
  fontSize,
  fonts,
  radii,
  sizes,
  spacing,
  touch,
} from "@/theme";
import { Send } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

interface ChatComposerProps {
  value: string;
  canSend: boolean;
  keyboardOpen?: boolean;
  onChangeText: (value: string) => void;
  onSend: () => void;
}

const sendIconSize = fontSize.lg;
const composerInputMaxHeight = spacing.xxl + spacing.xxl - spacing.md;

export default function ChatComposer({
  value,
  canSend,
  keyboardOpen = false,
  onChangeText,
  onSend,
}: ChatComposerProps) {
  return (
    <View style={[styles.container, keyboardOpen && styles.containerOpen]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Escreva para o Techy"
        placeholderTextColor={colors.gray}
        multiline
        maxLength={280}
        keyboardAppearance="light"
        accessibilityLabel="Mensagem para o Techy"
        containerStyle={styles.inputContainer}
        style={styles.input}
      />
      <InteractivePressable
        onPress={onSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Enviar mensagem"
        accessibilityState={{ disabled: !canSend }}
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
      >
        <Send
          size={sendIconSize}
          strokeWidth={borders.strong}
          color={canSend ? colors.white : colors.gray}
        />
      </InteractivePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  containerOpen: {
    paddingBottom: spacing.lg,
  },
  inputContainer: {
    flex: 1,
    minHeight: sizes.inputField,
    justifyContent: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
  },
  input: {
    minHeight: touch.minTarget,
    maxHeight: composerInputMaxHeight,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    textAlignVertical: "center",
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
  },
  sendButton: {
    width: sizes.inputField,
    height: sizes.inputField,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borders.thin,
    borderColor: colors.black,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    borderColor: colors.gray,
    backgroundColor: colors.grayLight,
  },
});
