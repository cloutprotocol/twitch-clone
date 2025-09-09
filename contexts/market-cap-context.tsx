"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MarketCapData {
  marketCap: number;
  tokenAddress: string;
  lastUpdated: string;
}

interface MarketCapContextType {
  marketCapData: MarketCapData | null;
  updateMarketCap: (data: MarketCapData) => void;
  refreshMarketCap: (tokenAddress: string) => Promise<void>;
  isRefreshing: boolean;
}

const MarketCapContext = createContext<MarketCapContextType | null>(null);

export const useMarketCap = () => {
  const context = useContext(MarketCapContext);
  if (!context) {
    throw new Error('useMarketCap must be used within a MarketCapProvider');
  }
  return context;
};

interface MarketCapProviderProps {
  children: ReactNode;
}

export const MarketCapProvider = ({ children }: MarketCapProviderProps) => {
  const [marketCapData, setMarketCapData] = useState<MarketCapData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateMarketCap = useCallback((data: MarketCapData) => {
    setMarketCapData(data);
  }, []);

  const refreshMarketCap = useCallback(async (tokenAddress: string) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/token/${tokenAddress}/market-cap`);
      if (response.ok) {
        const data = await response.json();
        const newMarketCapData = {
          marketCap: data.marketCap || 0,
          tokenAddress: tokenAddress,
          lastUpdated: new Date().toISOString(),
        };
        setMarketCapData(newMarketCapData);
        return newMarketCapData;
      }
    } catch (error) {
      console.error('Failed to refresh market cap:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  return (
    <MarketCapContext.Provider
      value={{
        marketCapData,
        updateMarketCap,
        refreshMarketCap,
        isRefreshing,
      }}
    >
      {children}
    </MarketCapContext.Provider>
  );
};