"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { tokenChartService, TokenData, TokenChartService } from "@/lib/token-chart-service";
import { 
  TokenChartErrorHandler, 
  TokenChartError, 
  TokenChartErrorType,
  TokenChartServiceError 
} from "@/lib/token-chart-errors";
import { retryWithBackoff } from "@/lib/token-chart-utils";

export interface UseTokenDataState {
  data: TokenData | null;
  loading: boolean;
  error: TokenChartError | null;
  lastUpdated: number | null;
  isStale: boolean;
}

export interface UseTokenDataActions {
  refetch: () => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

export interface UseTokenDataReturn extends UseTokenDataState, UseTokenDataActions {}

/**
 * React hook for managing token data with real-time updates
 */
export function useTokenData(tokenAddress: string | null): UseTokenDataReturn {
  const [state, setState] = useState<UseTokenDataState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
    isStale: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const currentTokenRef = useRef<string | null>(tokenAddress);

  // Update current token reference
  useEffect(() => {
    currentTokenRef.current = tokenAddress;
  }, [tokenAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Fetch token data with error handling
   */
  const fetchTokenData = useCallback(async (address: string, isRetry: boolean = false): Promise<void> => {
    if (!mountedRef.current || currentTokenRef.current !== address) {
      return;
    }

    console.log(`[useTokenData] Fetching data for: ${address}, isRetry: ${isRetry}`);

    // Don't show loading on retries to avoid flickering
    if (!isRetry) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      console.log(`[useTokenData] Calling tokenChartService.getTokenData for: ${address}`);
      
      const data = await retryWithBackoff(
        () => tokenChartService.getTokenData(address),
        3, // max retries
        1000 // base delay
      );

      console.log(`[useTokenData] Received data for ${address}:`, data);

      if (!mountedRef.current || currentTokenRef.current !== address) {
        console.log(`[useTokenData] Component unmounted or address changed, ignoring result`);
        return;
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        isStale: false,
      }));

      console.log(`[useTokenData] State updated successfully for: ${address}`);

    } catch (error) {
      console.error(`[useTokenData] Error fetching data for ${address}:`, error);
      
      if (!mountedRef.current || currentTokenRef.current !== address) {
        return;
      }

      const tokenError = error instanceof TokenChartServiceError 
        ? TokenChartErrorHandler.handleApiError(error, address)
        : TokenChartErrorHandler.handleApiError(error as Error, address);

      setState(prev => ({
        ...prev,
        loading: false,
        error: tokenError,
        isStale: prev.data ? true : false,
      }));

      // Schedule retry for recoverable errors
      if (TokenChartErrorHandler.shouldRetry(tokenError)) {
        const delay = TokenChartErrorHandler.getRetryDelay(tokenError);
        retryTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && currentTokenRef.current === address) {
            fetchTokenData(address, true);
          }
        }, delay);
      }
    }
  }, []);

  /**
   * Set up real-time updates
   */
  const setupRealTimeUpdates = useCallback((address: string) => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval for updates every 30 seconds
    intervalRef.current = setInterval(() => {
      if (mountedRef.current && currentTokenRef.current === address) {
        fetchTokenData(address, true);
      }
    }, 30000);
  }, [fetchTokenData]);

  /**
   * Check if data is stale (older than 5 minutes)
   */
  const checkStaleData = useCallback(() => {
    setState(prev => {
      if (!prev.lastUpdated) return prev;
      
      const isStale = Date.now() - prev.lastUpdated > 5 * 60 * 1000; // 5 minutes
      return prev.isStale !== isStale ? { ...prev, isStale } : prev;
    });
  }, []);

  /**
   * Main effect to handle token address changes
   */
  useEffect(() => {
    // Clear previous state when token changes
    if (tokenAddress !== currentTokenRef.current) {
      setState({
        data: null,
        loading: false,
        error: null,
        lastUpdated: null,
        isStale: false,
      });
    }

    // Clear intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Start fetching if we have a valid token address
    if (tokenAddress && TokenChartService.isValidTokenAddress(tokenAddress)) {
      fetchTokenData(tokenAddress);
      setupRealTimeUpdates(tokenAddress);
    } else if (tokenAddress) {
      // Invalid token address
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          type: TokenChartErrorType.INVALID_ADDRESS,
          message: 'Invalid token address format',
          action: 'show_address_only',
        },
      }));
    }
  }, [tokenAddress, fetchTokenData, setupRealTimeUpdates]);

  /**
   * Set up stale data checking
   */
  useEffect(() => {
    const staleCheckInterval = setInterval(checkStaleData, 60000); // Check every minute
    return () => clearInterval(staleCheckInterval);
  }, [checkStaleData]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (tokenAddress && TokenChartService.isValidTokenAddress(tokenAddress)) {
      await fetchTokenData(tokenAddress);
    }
  }, [tokenAddress, fetchTokenData]);

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Retry after error
   */
  const retry = useCallback(async (): Promise<void> => {
    if (tokenAddress && TokenChartService.isValidTokenAddress(tokenAddress)) {
      clearError();
      await fetchTokenData(tokenAddress);
    }
  }, [tokenAddress, fetchTokenData, clearError]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    isStale: state.isStale,
    refetch,
    clearError,
    retry,
  };
}

/**
 * Hook for managing multiple token data (useful for admin/analytics)
 */
export function useMultipleTokenData(tokenAddresses: string[]): {
  [address: string]: UseTokenDataReturn;
} {
  const results: { [address: string]: UseTokenDataReturn } = {};
  
  tokenAddresses.forEach(address => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[address] = useTokenData(address);
  });
  
  return results;
}

/**
 * Hook for token data with local storage persistence
 */
export function useTokenDataWithStorage(
  tokenAddress: string | null,
  storageKey: string
): UseTokenDataReturn & { 
  cachedData: TokenData | null;
  clearCache: () => void;
} {
  const tokenData = useTokenData(tokenAddress);
  const [cachedData, setCachedData] = useState<TokenData | null>(null);

  // Load cached data on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && tokenAddress) {
      try {
        const cached = localStorage.getItem(`${storageKey}_${tokenAddress}`);
        if (cached) {
          const parsedData = JSON.parse(cached);
          // Check if cached data is not too old (1 hour)
          if (Date.now() - parsedData.lastUpdated < 60 * 60 * 1000) {
            setCachedData(parsedData);
          }
        }
      } catch (error) {
        console.warn('Failed to load cached token data:', error);
      }
    }
  }, [tokenAddress, storageKey]);

  // Save data to cache when it updates
  useEffect(() => {
    if (typeof window !== 'undefined' && tokenData.data && tokenAddress) {
      try {
        localStorage.setItem(
          `${storageKey}_${tokenAddress}`,
          JSON.stringify(tokenData.data)
        );
        setCachedData(tokenData.data);
      } catch (error) {
        console.warn('Failed to cache token data:', error);
      }
    }
  }, [tokenData.data, tokenAddress, storageKey]);

  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined' && tokenAddress) {
      try {
        localStorage.removeItem(`${storageKey}_${tokenAddress}`);
        setCachedData(null);
      } catch (error) {
        console.warn('Failed to clear cached token data:', error);
      }
    }
  }, [tokenAddress, storageKey]);

  return {
    ...tokenData,
    cachedData,
    clearCache,
  };
}