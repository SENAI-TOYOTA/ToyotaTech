import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import {
  useFonts,
  Afacad_400Regular,
  Afacad_500Medium,
  Afacad_600SemiBold,
  Afacad_700Bold,
  Afacad_400Regular_Italic,
  Afacad_500Medium_Italic,
  Afacad_600SemiBold_Italic,
  Afacad_700Bold_Italic,
} from "@expo-google-fonts/afacad";
import * as SplashScreen from "expo-splash-screen";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoadingSession } = useAuth();

  const isInAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (isLoadingSession) {
      return;
    }

    if (!isAuthenticated && !isInAuthGroup) {
      router.replace("/");
      return;
    }

    if (isAuthenticated && isInAuthGroup) {
      router.replace("/home");
    }
  }, [isAuthenticated, isInAuthGroup, isLoadingSession, router]);

  if (isLoadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Afacad_400Regular,
    Afacad_500Medium,
    Afacad_600SemiBold,
    Afacad_700Bold,
    Afacad_400Regular_Italic,
    Afacad_500Medium_Italic,
    Afacad_600SemiBold_Italic,
    Afacad_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
