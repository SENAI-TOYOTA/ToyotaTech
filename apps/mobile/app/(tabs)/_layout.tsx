import { Tabs } from "expo-router";
import {
  CarFront,
  Home,
  LucideIcon,
  User,
  Wallet,
  Wrench,
} from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AssistantFab from "@/components/chat/AssistantFab";
import AppHeader from "@/components/layout/AppHeader";
import { useIsWide } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { colors, fonts, shadows, spacing } from "@/theme";

const iconSize = 22;

const visibleTabs: { name: string; title: string; icon: LucideIcon }[] = [
  { name: "home", title: "Home", icon: Home },
  { name: "services", title: "Services", icon: Wrench },
  { name: "financing", title: "Financing", icon: Wallet },
  { name: "vehicle-management", title: "My vehicle", icon: CarFront },
  { name: "profile", title: "Profile", icon: User },
];

const hiddenTabs: { name: string; title: string }[] = [
  { name: "tracking", title: "Order status" },
  { name: "maintenance", title: "Maintenance" },
  { name: "schedule-service", title: "Book a service" },
  { name: "warranty", title: "Warranty" },
  { name: "roadside", title: "Roadside assistance" },
  { name: "dealers", title: "Dealerships" },
  { name: "assistant", title: "Toyota Assistant" },
  { name: "rewards", title: "Points and rewards" },
  { name: "store", title: "Toyota Store" },
  { name: "news", title: "News and videos" },
];

export default function TabsLayout() {
  const isWide = useIsWide();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 68 + insets.bottom;
  const tabBarInsetStyle = {
    height: tabBarHeight,
    paddingBottom: 6 + insets.bottom,
  };

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          header: () => <AppHeader />,
          sceneStyle: styles.scene,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: isWide
            ? styles.tabBarHidden
            : [styles.tabBar, tabBarInsetStyle],
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        {visibleTabs.map(({ name, title, icon: Icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: t(title),
              tabBarIcon: ({ color, focused }) => (
                <Icon
                  size={iconSize}
                  strokeWidth={focused ? 2.2 : 1.8}
                  color={color}
                />
              ),
            }}
          />
        ))}
        {hiddenTabs.map(({ name, title }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{ href: null, title: t(title) }}
          />
        ))}
      </Tabs>
      <AssistantFab
        bottomOffset={isWide ? spacing.xl : tabBarHeight + spacing.md}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scene: {
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    ...shadows.bar,
  },
  tabBarHidden: {
    display: "none",
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 2,
  },
  tabBarItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});
