import { Tabs } from "expo-router";
import { Bell, CarFront, CircleDollarSign, User } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { colors, fontSize, spacing } from "@/constants/theme";

const iconSize = 22;
const iconStrokeWidth = 1.8;

function TabsHeader() {
  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.headerContent}>
        <Logo size={fontSize.xxl + spacing.xs} />
      </View>
    </SafeAreaView>
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
          tabBarIcon: ({ color }) => (
            <Bell size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
          ),
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
    backgroundColor: colors.background,
  },
  headerContent: {
    paddingTop: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg + 3,
    paddingBottom: spacing.sm + 2,
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
});
