import { Stack, useRouter } from "expo-router";
import { BellOff, X } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Screen from "@/components/ui/Screen";
import { t } from "@/i18n";
import { colors, fonts, fontSize, layout, radius, spacing } from "@/theme";

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
        <View style={styles.headerBar}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title} accessibilityRole="header">
                {t("Inbox")}
              </Text>
              <Text style={styles.subtitle}>
                {t("Updates about your order and vehicle")}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/home")
              }
              accessibilityRole="button"
              accessibilityLabel={t("Close inbox")}
            >
              <X size={20} strokeWidth={2} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <Screen maxWidth={640}>
          <Card>
            <EmptyState
              icon={BellOff}
              title="You are all caught up"
              description="New messages about your order, financing and documents will appear here."
            />
          </Card>
        </Screen>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    width: "100%",
    maxWidth: 640,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.gutter,
    paddingVertical: spacing.md - 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
