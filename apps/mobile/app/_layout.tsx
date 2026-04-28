import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "@expo-google-fonts/afacad";
import {
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

SplashScreen.preventAutoHideAsync();

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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
