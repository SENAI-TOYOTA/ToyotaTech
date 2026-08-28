import { Tabs, useRouter } from "expo-router";
import { CarFront, CircleDollarSign, Home, User } from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import Logo from "@/components/Logo";
import { colors, fontSize, spacing } from "@/theme";

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
          accessibilityLabel="Go to home"
        >
          <Logo size={fontSize.xxl + spacing.xs} />
        </Pressable>
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
  color: string;
  Icon: typeof Home;
}) {
  const scale = useSharedValue(1);
  const indicatorOpacity = useSharedValue(0);
  const indicatorScale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 15,
      stiffness: 150,
    });
    indicatorOpacity.value = withTiming(focused ? 1 : 0, { duration: 250 });
    indicatorScale.value = withSpring(focused ? 1 : 0.5);
  }, [focused, scale, indicatorOpacity, indicatorScale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scaleX: indicatorScale.value }],
  }));

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View style={animatedIconStyle}>
        <Icon size={iconSize} strokeWidth={iconStrokeWidth} color={color} />
      </Animated.View>
      <Animated.View style={[styles.tabIndicator, animatedIndicatorStyle]} />
    </View>
  );
});

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
          title: "Financing",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CircleDollarSign} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicle-management"
        options={{
          title: "Vehicle Management",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={CarFront} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          href: null,
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
    height: spacing.xxl + spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: "0px -1px 10px rgba(0, 0, 0, 0.12)",
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
