import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = 'https://czagsiatqspdzloohpuq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_r37XqrmWvwtC17UbjnK5wA_Zq9egcvZ';

// SecureStore has a 2048 byte limit per key.
// Supabase session tokens exceed this, so we split large values into chunks
// and reassemble them on read.
const CHUNK_SIZE = 2000;

const ChunkedSecureStoreAdapter = {
  getItem: async (key) => {
    // First try reading it as a single value (for small items)
    const single = await SecureStore.getItemAsync(key);
    if (single !== null) return single;

    // Otherwise reassemble from chunks
    const chunks = [];
    let i = 0;
    while (true) {
      const chunk = await SecureStore.getItemAsync(`${key}.chunk.${i}`);
      if (chunk === null) break;
      chunks.push(chunk);
      i++;
    }
    return chunks.length > 0 ? chunks.join('') : null;
  },

  setItem: async (key, value) => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    // Split into chunks and store each one
    const totalChunks = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}.chunk.${i}`, chunk);
    }

    // Remove the base key in case a previous non-chunked value exists
    await SecureStore.deleteItemAsync(key).catch(() => {});
  },

  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key).catch(() => {});

    // Also clean up any chunks
    let i = 0;
    while (true) {
      const chunk = await SecureStore.getItemAsync(`${key}.chunk.${i}`);
      if (chunk === null) break;
      await SecureStore.deleteItemAsync(`${key}.chunk.${i}`);
      i++;
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ChunkedSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
