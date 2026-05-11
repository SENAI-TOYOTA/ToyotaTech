import { useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";

import Button from "@/components/ui/Button";
import { colors, fonts, fontSize, spacing } from "@/constants/theme";
import { AuthScreenLayout } from "./_layout";

const CODE_LENGTH = 4;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array.from({ length: CODE_LENGTH }, () => "")
  );

  const handleCodeChange = (rawValue: string, index: number) => {
    const digits = rawValue.replace(/\D/g, "");

    if (digits.length > 1) {
      setVerificationCode((currentCode) => {
        const nextCode = [...currentCode];
        digits
          .slice(0, CODE_LENGTH - index)
          .split("")
          .forEach((digit, offset) => {
            nextCode[index + offset] = digit;
          });
        return nextCode;
      });

      const focusIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const nextDigit = digits.slice(-1);
    setVerificationCode((currentCode) => {
      const nextCode = [...currentCode];
      nextCode[index] = nextDigit;
      return nextCode;
    });

    if (nextDigit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPress = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }

    router.push("/(auth)/login");
  };

  return (
    <AuthScreenLayout contentSectionStyle={styles.contentSection}>
      <Text style={styles.title}>VERIFIQUE SEU EMAIL</Text>
      <Text style={styles.subtitle}>Não se esqueça de olhar a caixa de spam!</Text>

      <View style={styles.formContainer}>
        <View style={styles.emailRow}>
          <Text style={styles.emailLabel}>Email enviado para:</Text>
          <Text style={styles.emailValue}>em***@mail.com</Text>
        </View>

        <View style={styles.codeInputsRow}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleCodeKeyPress(nativeEvent.key, index)
              }
              maxLength={CODE_LENGTH}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              style={styles.codeInput}
              textAlign="center"
              selectionColor={colors.black}
            />
          ))}
        </View>

        <Button
          title="Verificar"
          variant="primary"
          icon={
            <ArrowRight
              size={36}
              strokeWidth={3}
              color={colors.white}
              strokeLinecap="butt"
              strokeLinejoin="round"
            />
          }
          style={styles.verifyButton}
          onPress={handleVerifyPress}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  contentSection: {
    marginTop: 58,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: colors.black,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  formContainer: {
    marginTop: 74,
    width: "100%",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emailValue: {
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  codeInputsRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 2,
    backgroundColor: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
  },
  verifyButton: {
    width: "100%",
    marginTop: spacing.lg,
  },
});
