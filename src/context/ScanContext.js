import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProduct } from '../services/openFoodFacts';
import { check } from '../services/fastingChecker';

const ScanContext = createContext(null);

const HISTORY_KEY = 'scan_history';
const MAX_HISTORY = 20;

export function ScanProvider({ children }) {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      if (json) setHistory(JSON.parse(json));
    } catch (_) {}
  }, []);

  const saveHistory = useCallback(async (newHistory) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (_) {}
  }, []);

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

      // Add to history
      const entry = {
        barcode: product.barcode,
        productName: product.name || 'Unknown Product',
        verdict: result.verdict,
        scannedAt: new Date().toISOString(),
      };
      const newHistory = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    }

    setIsLoading(false);
  }, [history, saveHistory]);

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
