import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ScanProvider } from '../src/context/ScanContext';
import { RecipeProvider } from '../src/context/RecipeContext';
import { colors } from '../src/constants/theme';

// Separated so we can call useAuth() inside AuthProvider
function InnerLayout() {
  const { session, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Only check onboarding once the user is logged in
  useEffect(() => {
    if (!session) return;
    AsyncStorage.getItem('has_seen_onboarding').then((seen) => {
      setNeedsOnboarding(!seen);
      setOnboardingChecked(true);
    });
  }, [session]);

  // Navigation gate — runs whenever auth or onboarding state changes
  useEffect(() => {
    if (loading) return;

    const onAuth = segments[0] === 'auth';
    const onOnboarding = segments[0] === 'onboarding';

    if (!session && !onAuth) {
      router.replace('/auth');
      return;
    }

    if (session && onboardingChecked && needsOnboarding && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [loading, session, onboardingChecked, needsOnboarding, segments]);

  if (loading) return null;

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
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scan-result" />
          <Stack.Screen name="recipe-detail/[id]" />
        </Stack>
      </RecipeProvider>
    </ScanProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}
