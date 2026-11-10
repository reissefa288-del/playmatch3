import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { FontModeProvider } from '@/design/font-mode';
import { colors, font } from '@/design/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded || error) setReady(true);
  }, [loaded, error]);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <FontModeProvider mode={loaded && !error ? 'inter' : 'system'}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.pink,
          headerTitleStyle: loaded
            ? { fontFamily: font.semibold, color: colors.text }
            : { color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ headerShown: false }} />
        <Stack.Screen name="word-game" options={{ headerShown: false }} />
        <Stack.Screen name="block-puzzle" options={{ headerShown: false }} />
        <Stack.Screen name="galaxy-duel" options={{ headerShown: false }} />
        <Stack.Screen name="animal-tile-match" options={{ headerShown: false }} />
        <Stack.Screen name="ocean-kingdom" options={{ headerShown: false }} />
        <Stack.Screen name="aztec-tiles" options={{ headerShown: false }} />
        <Stack.Screen name="aztec-match" options={{ headerShown: false }} />
        <Stack.Screen name="deneme-4" options={{ headerShown: false }} />
        <Stack.Screen name="chess-duel" options={{ headerShown: false }} />
      </Stack>
    </FontModeProvider>
  );
}
