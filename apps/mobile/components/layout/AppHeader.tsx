import { Href, usePathname, useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { useIsWide } from "@/components/ui/Screen";
import { useAuth } from "@/contexts/AuthContext";
import { t } from "@/i18n";
import { colors, fonts, fontSize, layout, radius, spacing } from "@/theme";

export const navigationItems: { route: Href; path: string; label: string }[] = [
  { route: "/home", path: "/home", label: "Home" },
  { route: "/services", path: "/services", label: "Services" },
  { route: "/store", path: "/store", label: "Store" },
  { route: "/rewards", path: "/rewards", label: "Rewards" },
  { route: "/news", path: "/news", label: "News" },
  { route: "/financing", path: "/financing", label: "Financing" },
  {
    route: "/vehicle-management",
    path: "/vehicle-management",
    label: "My vehicle",
  },
];

const servicePaths = [
  "/maintenance",
  "/schedule-service",
  "/warranty",
  "/roadside",
  "/dealers",
];

function resolveActivePath(pathname: string) {
  if (pathname === "/tracking") {
    return "/home";
  }
  if (servicePaths.includes(pathname)) {
    return "/services";
  }
  return pathname;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "T";
  }
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function NavLink({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.navLink, isHovered && !isActive && styles.navLinkHovered]}
    >
      <Text style={[styles.navText, isActive && styles.navTextActive]}>
        {t(label)}
      </Text>
      <View style={[styles.navIndicator, isActive && styles.navIndicatorOn]} />
    </Pressable>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const isWide = useIsWide();
  const { user } = useAuth();
  const displayName = user?.profile?.fullName || user?.name || "";
  const initials = getInitials(displayName || user?.email || "");
  const activePath = resolveActivePath(pathname);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.bar}>
        <View style={styles.inner}>
          <Pressable
            onPress={() => router.replace("/home")}
            accessibilityRole="button"
            accessibilityLabel={t("Go to home")}
          >
            <Logo size={isWide ? fontSize.xl + 2 : fontSize.xl} />
          </Pressable>

          {isWide ? (
            <View style={styles.nav}>
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  isActive={activePath === item.path}
                  onPress={() => router.navigate(item.route)}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel={t("Open notifications")}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Bell size={20} strokeWidth={1.8} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => router.navigate("/profile")}
              accessibilityRole="button"
              accessibilityLabel={t("Open profile")}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bar: {
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    height: 64,
    paddingHorizontal: layout.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  nav: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    alignSelf: "stretch",
    gap: spacing.xs,
    marginLeft: spacing.lg,
  },
  navLink: {
    justifyContent: "center",
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.sm,
  },
  navLinkHovered: {
    backgroundColor: colors.surfaceMuted,
  },
  navText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  navTextActive: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  navIndicator: {
    position: "absolute",
    left: spacing.md - 2,
    right: spacing.md - 2,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: "transparent",
  },
  navIndicatorOn: {
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm + 1,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
