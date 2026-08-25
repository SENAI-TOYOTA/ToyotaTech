import { Stack, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fontSize, fonts, spacing } from "@/theme";

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Caixa de entrada</Text>

          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Fechar caixa de entrada"
          >
            <X size={fontSize.xl} strokeWidth={2} color={colors.black} />
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg + 3,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  closeButton: {
    width: spacing.xl + spacing.sm,
    height: spacing.xl + spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: (spacing.xl + spacing.sm) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
