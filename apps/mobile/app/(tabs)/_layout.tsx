import { Tabs, useRouter } from "expo-router";
import { Bell, CarFront, CircleDollarSign, Home, User } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

import Logo from "@/components/Logo";
import { colors, fontSize, spacing } from "@/constants/theme";

const iconSize = 22;
const iconStrokeWidth = 1.8;

function TabsHeader() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.headerContent}>
        <Pressable
          onPress={() => router.replace("/home")}
          accessibilityRole="button"
          accessibilityLabel="Ir para a home"
        >
          <Logo size={fontSize.xxl + spacing.xs} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function NotificationTabBarButton({
  children,
  style,
  accessibilityState,
  accessibilityLabel,
  testID,
  onLongPress,
}: BottomTabBarButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={style}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel ?? "Abrir caixa de entrada"}
      testID={testID}
      onLongPress={onLongPress}
      onPress={() => router.push("/notifications")}
    >
      {children}
    </Pressable>
  );
}

function TabIcon({
  focused,
  color,
  Icon,
}: {
  focused: boolean;
  color: string;
  Icon: typeof Home;
}) {
  return (
    <View style={styles.tabIconWrapper}>
      <Icon size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
      {focused ? <View style={styles.tabIndicator} /> : null}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <TabsHeader />,
        headerShadowVisible: false,
        sceneStyle: styles.scene,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.black,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="financing"
        options={{
          title: "Financiamento",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CircleDollarSign} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle-management"
        options={{
          title: "Gestão do veículo",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CarFront} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications-tab"
        options={{
          title: "Notificações",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Bell} color={color} focused={focused} />
          ),
          tabBarButton: (props) => <NotificationTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    width: "100%",
    backgroundColor: colors.background,
  },
  headerContent: {
    width: "100%",
    paddingTop: spacing.md + spacing.xs,
    paddingLeft: spacing.lg + 3,
    paddingBottom: spacing.sm + 2,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: colors.background,
  },
  tabBar: {
    height: spacing.xxl + 2,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabBarItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapper: {
    width: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIndicator: {
    marginTop: 6,
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
