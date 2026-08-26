import {
  Afacad_400Regular,
  Afacad_500Medium,
  Afacad_600SemiBold,
  Afacad_700Bold,
  useFonts,
} from "@expo-google-fonts/afacad";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme";

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

function AppNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoadingSession, user } = useAuth();

  const isInAuthGroup = segments[0] === "(auth)";
  const isInProfileSetup = segments[0] === "profile-setup";
  const needsProfile =
    Boolean(isAuthenticated) &&
    (!user?.profile?.fullName ||
      !user?.profile?.birthDate ||
      !user?.profile?.cpf);

  useEffect(() => {
    if (isLoadingSession) {
      return;
    }

    if (!isAuthenticated && !isInAuthGroup) {
      router.replace("/");
      return;
    }

    if (isAuthenticated) {
      if (needsProfile && !isInProfileSetup) {
        router.replace("/profile-setup");
        return;
      }
      if (!needsProfile && isInProfileSetup) {
        router.replace("/home");
        return;
      }
      if (isInAuthGroup && !needsProfile) {
        router.replace("/home");
      }
    }
  }, [
    isAuthenticated,
    isInAuthGroup,
    isInProfileSetup,
    isLoadingSession,
    needsProfile,
    router,
  ]);

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
