import { Stack } from "expo-router";
import { ReactNode } from "react";
import {
  ColorValue,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { colors, fonts, fontSize, spacing } from "@/theme";

interface AuthScreenLayoutProps {
  children: ReactNode;
  bottomContent?: ReactNode;
  contentSectionStyle?: StyleProp<ViewStyle>;
  footerTextColor?: ColorValue;
}

export function AuthScreenLayout({
  children,
  bottomContent,
  contentSectionStyle,
  footerTextColor,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Logo size={fontSize.logo} />
          </View>
          <View style={[styles.contentSection, contentSectionStyle]}>
            {children}
          </View>
        </View>

        <View style={styles.bottomSection}>
          {bottomContent}
          <Text
            style={[
              styles.footerText,
              footerTextColor && { color: footerTextColor },
            ]}
          >
            all rights reserved 2026
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 55,
    paddingTop: 48,
    paddingBottom: 48,
  },
  topSection: {
    width: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  contentSection: {
    width: "100%",
  },
  bottomSection: {
    alignItems: "center",
    gap: spacing.lg,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.black,
  },
});
