import Logo from "@/components/Logo";
import Screen from "@/components/ui/Screen";
import { colors, fonts, fontSize, layout, spacing } from "@/theme";
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
    <Screen
      scroll={false}
      edges={["top", "bottom"]}
      contentStyle={styles.container}
    >
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
            footerTextColor ? { color: footerTextColor } : null,
          ]}
        >
          todos os direitos reservados © 2026
        </Text>
      </View>
    </Screen>
  );
}

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: layout.authPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
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
