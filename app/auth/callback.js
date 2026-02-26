import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/lib/supabase';
import { colors, typography } from '../../src/constants/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    verifyEmail();
  }, []);

  async function verifyEmail() {
    try {
      const code = searchParams.get('code');
      const type = searchParams.get('type');

      if (!code) {
        throw new Error('No confirmation code found');
      }

      // Verify the OTP (one-time password) sent via email
      const { error } = await supabase.auth.verifyOtp({
        email: searchParams.get('email') || '',
        token: code,
        type: type === 'signup' ? 'signup' : 'recovery',
      });

      if (error) {
        throw error;
      }

      // Success — redirect to home after a brief delay
      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (err) {
      console.error('Email verification failed:', err.message);
      // Redirect back to auth on failure after 2 seconds
      setTimeout(() => {
        router.replace('/auth');
      }, 2000);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={[typography.bodyLarge, { marginTop: 16 }]}>
          Verifying your email...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
