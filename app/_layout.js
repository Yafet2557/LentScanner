import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScanProvider } from '../src/context/ScanContext';
import { RecipeProvider } from '../src/context/RecipeContext';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
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
        />
      </RecipeProvider>
    </ScanProvider>
  );
}
