"use client";

import { useState, useEffect, useCallback } from 'react';
import { dexScreenerService, TokenPriceData } from '@/lib/dexscreener-service';

interface SharedTokenData {
  priceData: TokenPriceData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

// Global store for token data to share between components
const tokenDataStore = new Map<string, {
  data: SharedTokenData;
  subscribers: Set<(data: SharedTokenData) => void>;
}>();

export const useSharedTokenData = (tokenAddress: string): SharedTokenData => {
  const [data, setData] = useState<SharedTokenData>({
    priceData: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    refresh: async () => {},
  });

  const refresh = useCallback(async () => {
    if (!tokenAddress) return;

    const storeEntry = tokenDataStore.get(tokenAddress);
    if (!storeEntry) return;

    // Update loading state
    const loadingData = { ...storeEntry.data, isLoading: true };
    storeEntry.data = loadingData;
    storeEntry.subscribers.forEach(callback => callback(loadingData));

    try {
      const priceData = await dexScreenerService.getTokenPriceData(tokenAddress);
      
      console.log('Shared token data fetched:', {
        tokenAddress,
        marketCap: priceData?.marketCap,
        price: priceData?.price,
        hasData: !!priceData
      });
      
      const newData = {
        priceData,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
        refresh,
      };

      storeEntry.data = newData;
      storeEntry.subscribers.forEach(callback => callback(newData));
    } catch (error) {
      const errorData = {
        priceData: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch token data',
        lastUpdated: null,
        refresh,
      };

      storeEntry.data = errorData;
      storeEntry.subscribers.forEach(callback => callback(errorData));
    }
  }, [tokenAddress]);

  useEffect(() => {
    if (!tokenAddress) return;

    // Initialize store entry if it doesn't exist
    if (!tokenDataStore.has(tokenAddress)) {
      tokenDataStore.set(tokenAddress, {
        data: {
          priceData: null,
          isLoading: true,
          error: null,
          lastUpdated: null,
          refresh,
        },
        subscribers: new Set(),
      });
    }

    const storeEntry = tokenDataStore.get(tokenAddress)!;
    
    // Update refresh function reference
    storeEntry.data.refresh = refresh;

    // Subscribe to updates
    storeEntry.subscribers.add(setData);
    
    // Set initial data
    setData(storeEntry.data);

    // Initial fetch if no data exists
    if (!storeEntry.data.priceData && storeEntry.data.isLoading) {
      refresh();
    }

    // Set up polling interval (2 minutes)
    const pollInterval = setInterval(() => {
      if (storeEntry.subscribers.size > 0) {
        refresh();
      }
    }, 120000);

    return () => {
      // Unsubscribe
      storeEntry.subscribers.delete(setData);
      
      // Clean up interval if no subscribers left
      if (storeEntry.subscribers.size === 0) {
        clearInterval(pollInterval);
        tokenDataStore.delete(tokenAddress);
      }
    };
  }, [tokenAddress, refresh]);

  return data;
};