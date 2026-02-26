import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://czagsiatqspdzloohpuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_r37XqrmWvwtC17UbjnK5wA_Zq9egcvZ';

// SecureStore adapter — Supabase needs somewhere to persist the auth session
// token between app launches. SecureStore encrypts it on-device.
const SecureStoreAdapter = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // required for React Native (no browser URL bar)
  },
});
