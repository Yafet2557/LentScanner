import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanProvider } from '../src/context/ScanContext';
import { RecipeProvider } from '../src/context/RecipeContext';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      const seen = await AsyncStorage.getItem('has_seen_onboarding');
      setNeedsOnboarding(!seen);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const onOnboarding = segments[0] === 'onboarding';

    if (needsOnboarding && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [isReady, needsOnboarding, segments]);

  if (!isReady) return null;

  return (
    <ScanProvider>
      <RecipeProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scan-result" />
          <Stack.Screen name="recipe-detail/[id]" />
        </Stack>
      </RecipeProvider>
    </ScanProvider>
  );
}
