import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProduct } from '../services/openFoodFacts';
import { check } from '../services/fastingChecker';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const ScanContext = createContext(null);

const HISTORY_KEY = 'scan_history';
const MAX_HISTORY = 20;

export function ScanProvider({ children }) {
  const { user } = useAuth();

  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      if (user) {
        // Logged in — fetch from Supabase
        const { data } = await supabase
          .from('scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('scanned_at', { ascending: false })
          .limit(MAX_HISTORY);

        if (data) {
          // Map snake_case columns back to camelCase for the rest of the app
          setHistory(data.map((row) => ({
            barcode: row.barcode,
            productName: row.product_name,
            verdict: row.verdict,
            scannedAt: row.scanned_at,
          })));
        }
      } else {
        // Guest — use local storage
        const json = await AsyncStorage.getItem(HISTORY_KEY);
        if (json) setHistory(JSON.parse(json));
      }
    } catch (_) {}
  }, [user]);

  // Reload history whenever auth state changes (login or logout)
  useEffect(() => {
    loadHistory();
  }, [user]);

  const scanBarcode = useCallback(async (barcode) => {
    setIsLoading(true);
    setError(null);
    setCurrentProduct(null);
    setCurrentResult(null);

    try {
      const product = await getProduct(barcode);
      if (!product) {
        setError('Product not found in database');
        setIsLoading(false);
        return;
      }

      const result = check(product.ingredientsText);
      setCurrentProduct(product);
      setCurrentResult(result);

      const entry = {
        barcode: product.barcode,
        productName: product.name || 'Unknown Product',
        verdict: result.verdict,
        scannedAt: new Date().toISOString(),
      };

      if (user) {
        // Logged in — insert single row to Supabase
        await supabase.from('scan_history').insert({
          user_id: user.id,
          barcode: entry.barcode,
          product_name: entry.productName,
          verdict: entry.verdict,
          scanned_at: entry.scannedAt,
        });
        setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      } else {
        // Guest — save full array to AsyncStorage
        const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
        setHistory(newHistory);
        try {
          await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        } catch (_) {}
      }
    } catch (e) {
      setError(e.message || 'Something went wrong');
    }

    setIsLoading(false);
  }, [user, history]);

  const clearCurrentScan = useCallback(() => {
    setCurrentProduct(null);
    setCurrentResult(null);
    setError(null);
  }, []);

  return (
    <ScanContext.Provider
      value={{
        currentProduct,
        currentResult,
        isLoading,
        error,
        history,
        scanBarcode,
        loadHistory,
        clearCurrentScan,
      }}
    >
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScan must be used within a ScanProvider');
  return ctx;
}
