export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

export interface TokenPriceData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  dexId: string;
  pairAddress: string;
}

export class DexScreenerService {
  private cache = new Map<string, { data: TokenPriceData; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getTokenPriceData(tokenAddress: string): Promise<TokenPriceData | null> {
    // Check cache first
    const cached = this.cache.get(tokenAddress);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`[DexScreenerService] Returning cached data for: ${tokenAddress}`);
      return cached.data;
    }

    console.log(`[DexScreenerService] Fetching fresh data for: ${tokenAddress}`);

    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[DexScreenerService] API error: ${response.status}`);
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data: DexScreenerResponse = await response.json();
      console.log(`[DexScreenerService] Raw response for ${tokenAddress}:`, data);

      // Find the best pair (highest liquidity)
      if (data.pairs && data.pairs.length > 0) {
        const bestPair = data.pairs.reduce((best, current) => {
          const currentLiquidity = current.liquidity?.usd || 0;
          const bestLiquidity = best.liquidity?.usd || 0;
          return currentLiquidity > bestLiquidity ? current : best;
        });

        const priceData: TokenPriceData = {
          price: parseFloat(bestPair.priceUsd) || 0,
          priceChange24h: bestPair.priceChange?.h24 || 0,
          volume24h: bestPair.volume?.h24 || 0,
          marketCap: bestPair.marketCap || 0,
          liquidity: bestPair.liquidity?.usd || 0,
          dexId: bestPair.dexId,
          pairAddress: bestPair.pairAddress,
        };

        console.log(`[DexScreenerService] Processed data for ${tokenAddress}:`, priceData);

        // Cache the result
        this.cache.set(tokenAddress, {
          data: priceData,
          timestamp: Date.now(),
        });

        return priceData;
      }

      console.warn(`[DexScreenerService] No pairs found for token ${tokenAddress}`);
      return null;

    } catch (error) {
      console.error(`[DexScreenerService] Error fetching data for ${tokenAddress}:`, error);
      throw error;
    }
  }

  // Test method to check API connectivity
  async testAPI(tokenAddress: string = "GeJVqzGBDhCDQqJnpXbqAdBvzK1aWTR6pMjA2Dyspump"): Promise<void> {
    console.log(`[DexScreenerService] Testing API with token: ${tokenAddress}`);
    
    try {
      const data = await this.getTokenPriceData(tokenAddress);
      
      if (data) {
        console.log("✅ DexScreener API Test Successful!");
        console.log("📊 Price Data:", {
          price: `$${data.price}`,
          change24h: `${data.priceChange24h > 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%`,
          volume24h: `$${data.volume24h.toLocaleString()}`,
          marketCap: `$${data.marketCap.toLocaleString()}`,
          liquidity: `$${data.liquidity.toLocaleString()}`,
          dex: data.dexId,
        });
      } else {
        console.log("⚠️ No price data found for this token");
      }
    } catch (error) {
      console.error("❌ DexScreener API Test Failed:", error);
    }
  }
}

export const dexScreenerService = new DexScreenerService();