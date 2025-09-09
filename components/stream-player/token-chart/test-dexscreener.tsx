"use client";

import { useState, useEffect } from "react";
import { dexScreenerService, TokenPriceData } from "@/lib/dexscreener-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface TestDexScreenerProps {
  defaultTokenAddress?: string;
}

export const TestDexScreener = ({ defaultTokenAddress }: TestDexScreenerProps) => {
  const [tokenAddress, setTokenAddress] = useState(defaultTokenAddress || "GeJVqzGBDhCDQqJnpXbqAdBvzK1aWTR6pMjA2Dyspump");
  const [priceData, setPriceData] = useState<TokenPriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    if (!tokenAddress.trim()) return;

    setLoading(true);
    setError(null);
    setPriceData(null);

    try {
      console.log("🧪 Testing DexScreener API...");
      const data = await dexScreenerService.getTokenPriceData(tokenAddress.trim());
      setPriceData(data);
      
      if (data) {
        console.log("✅ Test successful! Data received:", data);
      } else {
        console.log("⚠️ No data found for this token");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("❌ Test failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-test on mount and when token address changes
  useEffect(() => {
    testAPI();
  }, [defaultTokenAddress]);

  // Update token address when prop changes
  useEffect(() => {
    if (defaultTokenAddress) {
      setTokenAddress(defaultTokenAddress);
    }
  }, [defaultTokenAddress]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <Card className="bg-background-secondary border-border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-interactive-primary" />
          DexScreener API Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Controls */}
        <div className="flex gap-2">
          <Input
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Token address"
            className="flex-1"
          />
          <Button onClick={testAPI} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test API"
            )}
          </Button>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-4 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Fetching price data from DexScreener...
          </div>
        )}

        {error && (
          <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg">
            <p className="text-status-error font-medium">API Error</p>
            <p className="text-sm text-text-secondary mt-1">{error}</p>
          </div>
        )}

        {priceData && (
          <div className="space-y-4">
            <div className="p-3 bg-status-success/10 border border-status-success/20 rounded-lg">
              <p className="text-status-success font-medium">✅ API Test Successful!</p>
              <p className="text-sm text-text-secondary mt-1">
                Data fetched from {priceData.dexId} DEX
              </p>
            </div>

            {/* Price Data Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Current Price</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatPrice(priceData.price)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">24h Change</p>
                <div className="flex items-center gap-1">
                  {priceData.priceChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-status-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-status-error" />
                  )}
                  <p className={`font-semibold ${
                    priceData.priceChange24h >= 0 ? 'text-status-success' : 'text-status-error'
                  }`}>
                    {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Market Cap</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatLargeNumber(priceData.marketCap)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">24h Volume</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatLargeNumber(priceData.volume24h)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Liquidity</p>
                <p className="text-sm font-semibold text-text-primary">
                  {formatLargeNumber(priceData.liquidity)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-text-tertiary uppercase tracking-wide">DEX</p>
                <p className="text-sm font-semibold text-text-primary">
                  {priceData.dexId}
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div className="pt-3 border-t border-border-secondary">
              <p className="text-xs text-text-tertiary mb-2">Technical Details</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Pair Address:</span>
                  <span className="text-text-secondary font-mono">
                    {priceData.pairAddress.slice(0, 8)}...{priceData.pairAddress.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">DEX:</span>
                  <span className="text-text-secondary">{priceData.dexId}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !priceData && (
          <div className="text-center py-4 text-text-tertiary">
            No data found for this token
          </div>
        )}
      </CardContent>
    </Card>
  );
};