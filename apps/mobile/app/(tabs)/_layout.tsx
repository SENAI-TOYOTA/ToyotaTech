import { Tabs, useRouter } from "expo-router";
import { CarFront, CircleDollarSign, Home, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { type ColorValue, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import ChatMascot from "@/components/ChatMascot";
import Logo from "@/components/Logo";
import InteractivePressable from "@/components/ui/InteractivePressable";
import {
  colors,
  fontSize,
  fonts,
  layout,
  radii,
  spacing,
  touch,
} from "@/theme";

const iconSize = 20;
const iconStrokeWidth = 1.8;
const chatMascotSize = spacing.xl + spacing.sm;
const chatFloatOffset = 2;

function ChatHeaderButton({ onPress }: { onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
  }, [float]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -chatFloatOffset * float.value }],
  }));

  return (
    <InteractivePressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel="Abrir assistente Toyota"
      style={[styles.chatButton, hovered && styles.chatButtonHover]}
    >
      <Animated.View style={mascotStyle}>
        <ChatMascot size={chatMascotSize} mood="idle" />
      </Animated.View>
    </InteractivePressable>
  );
}

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
        <ChatHeaderButton onPress={() => router.push("/chat")} />
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

  useEffect(() => {
    scale.value = withSpring(focused ? 1.05 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [focused, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View style={animatedIconStyle}>
        <Icon
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          color={focused ? colors.primary : (color as string)}
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
    paddingRight: layout.screenPadding,
    paddingBottom: spacing.sm + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
  },
  logoPressable: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  chatButton: {
    minWidth: touch.minTarget,
    minHeight: touch.minTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  chatButtonHover: {
    backgroundColor: colors.grayLight,
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
});
