import { Tabs, useRouter } from "expo-router";
import { CarFront, CircleDollarSign, Home, User } from "lucide-react-native";
import React, { useEffect } from "react";
import { type ColorValue, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import InteractivePressable from "@/components/ui/InteractivePressable";
import { colors, fonts, fontSize, spacing } from "@/theme";

const iconSize = 20;
const iconStrokeWidth = 1.8;

function TabsHeader() {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
      <View style={styles.headerContent}>
        <InteractivePressable
          onPress={() => router.replace("/home")}
          accessibilityRole="button"
          accessibilityLabel="Ir para o início"
          style={styles.logoPressable}
        >
          <Logo size={fontSize.xxl + spacing.xs} />
        </InteractivePressable>
      </View>
    </SafeAreaView>
  );
}

const TabIcon = React.memo(function TabIcon({
  focused,
  color,
  Icon,
}: {
  focused: boolean;
  color: ColorValue;
  Icon: typeof Home;
}) {
  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.05 : 1, {
      damping: 15,
      stiffness: 150,
    });
    pillOpacity.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, scale, pillOpacity]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View style={[styles.tabPill, animatedPillStyle]} />
      <Animated.View style={animatedIconStyle}>
        <Icon
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          color={focused ? colors.white : (color as string)}
        />
      </Animated.View>
    </View>
  );
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.xs);

  return (
    <Tabs
      screenOptions={{
        header: () => <TabsHeader />,
        headerShadowVisible: false,
        sceneStyle: styles.scene,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 56 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarLabel: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="financing"
        options={{
          title: "Financiamento",
          tabBarLabel: "Financiamento",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CircleDollarSign} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle-management"
        options={{
          title: "Gestão do veículo",
          tabBarLabel: "Veículo",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CarFront} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
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
  logoPressable: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: "0px -1px 10px rgba(0, 0, 0, 0.08)",
    elevation: 8,
    paddingTop: spacing.xs,
  },
  tabBarItem: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  tabIconWrapper: {
    width: 48,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPill: {
    position: "absolute",
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
  },
});
