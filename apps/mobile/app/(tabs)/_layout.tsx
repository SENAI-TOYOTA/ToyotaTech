import { Tabs, useRouter } from "expo-router";
import { Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import Svg, { Path } from "react-native-svg";

import Logo from "@/components/Logo";
import { colors, fontSize, spacing } from "@/constants/theme";

const iconSize = 22;
const iconStrokeWidth = 1.8;
const logoTabIconWidth = (iconSize * 32) / 53;

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

function HomeTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return (
    <Svg
      width={logoTabIconWidth}
      height={iconSize}
      viewBox="0 0 32 53"
      fill="none"
      style={!focused ? styles.homeIconInactive : undefined}
    >
      <Path
        d="M3.925 17.175L4.85 13.5H20.275L19.375 17.175H13.75L9.025 36H4.85L9.55 17.175H3.925Z"
        fill="#FF0404"
      />
      <Path
        d="M14.925 22.175L15.85 18.5H31.275L30.375 22.175H24.75L20.025 41H15.85L20.55 22.175H14.925Z"
        fill={focused ? colors.black : color}
      />
    </Svg>
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
      }}
    >
      <Tabs.Screen
        name="financing"
        options={{
          title: "Financiamento",
          tabBarIcon: ({ color }) => (
            <CircleDollarSign size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle-management"
        options={{
          title: "Gestão do veículo",
          tabBarIcon: ({ color }) => (
            <CarFront size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications-tab"
        options={{
          title: "Notificações",
          tabBarIcon: ({ color }) => (
            <Bell size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
          ),
          tabBarButton: (props) => <NotificationTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <User size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
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
  },
  homeIconInactive: {
    opacity: 0.7,
  },
});
