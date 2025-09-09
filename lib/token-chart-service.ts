import { Connection, PublicKey } from "@solana/web3.js";

// Types for token data
export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  decimals: number;
  logoURI?: string;
  lastUpdated: number;
}

export interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  supply?: number;
}

// Cache interface
interface CachedTokenData {
  data: TokenData;
  timestamp: number;
}



// DexScreener API response interface
interface DexScreenerPair {
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

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

export class TokenChartService {
  private cache = new Map<string, CachedTokenData>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private connection: Connection;

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      throw new Error("Solana RPC URL not configured");
    }
    this.connection = new Connection(rpcUrl);
  }

  /**
   * Get comprehensive token data from multiple sources
   */
  async getTokenData(address: string): Promise<TokenData> {
    // Check cache first
    const cached = this.getCachedData(address);
    if (cached) {
      return cached;
    }

    try {
      // If running in browser, use our API endpoint to avoid CORS issues
      if (typeof window !== 'undefined') {
        return await this.fetchFromAPI(address);
      }

      // Server-side: Use DexScreener as primary source
      const [dexScreenerData, metadata] = await Promise.allSettled([
        this.fetchDexScreenerData(address),
        this.getTokenMetadata(address)
      ]);

      // Combine data from sources
      const tokenData = this.combineTokenData(
        address,
        dexScreenerData,
        metadata
      );

      // Cache the result
      this.setCachedData(address, tokenData);

      return tokenData;
    } catch (error) {
      console.error(`Error fetching token data for ${address}:`, error);
      throw new Error(`Failed to fetch token data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch token data from our API endpoint (client-side)
   */
  private async fetchFromAPI(address: string): Promise<TokenData> {
    console.log(`[TokenChartService] Making API call to: /api/token-data/${address}`);

    const response = await fetch(`/api/token-data/${address}`);

    console.log(`[TokenChartService] API response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[TokenChartService] API error:`, errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[TokenChartService] API result:`, result);

    if (!result.success || !result.data) {
      console.error(`[TokenChartService] Invalid API response:`, result);
      throw new Error(result.error || 'Invalid API response');
    }

    // Cache the result
    this.setCachedData(address, result.data);

    console.log(`[TokenChartService] Successfully fetched and cached data for: ${address}`);
    return result.data;
  }



  /**
   * Fetch comprehensive data from DexScreener API
   */
  private async fetchDexScreenerData(address: string): Promise<DexScreenerPair | null> {
    try {
      console.log(`Fetching DexScreener data for: ${address}`);

      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`DexScreener API error: ${response.status}`);
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data: DexScreenerResponse = await response.json();
      console.log(`DexScreener response for ${address}:`, data);

      // Return the pair with highest liquidity (most reliable)
      if (data.pairs && data.pairs.length > 0) {
        const bestPair = data.pairs.reduce((best, current) => {
          const currentLiquidity = current.liquidity?.usd || 0;
          const bestLiquidity = best.liquidity?.usd || 0;
          return currentLiquidity > bestLiquidity ? current : best;
        });

        console.log(`Selected best pair for ${address}:`, {
          dexId: bestPair.dexId,
          priceUsd: bestPair.priceUsd,
          liquidity: bestPair.liquidity?.usd,
          volume24h: bestPair.volume?.h24,
          marketCap: bestPair.marketCap
        });

        return bestPair;
      }

      console.warn(`No pairs found for token ${address}`);
      return null;
    } catch (error) {
      console.error(`DexScreener API failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Get token metadata and supply data from Helius RPC
   */
  async getTokenMetadata(address: string): Promise<TokenMetadata & { supply?: number }> {
    try {
      const mintPublicKey = new PublicKey(address);

      console.log(`Fetching Helius metadata for: ${address}`);

      // Fetch token metadata and supply using Helius RPC
      const [metadataResponse, supplyResponse] = await Promise.all([
        this.fetchHeliusMetadata(address),
        this.fetchTokenSupply(mintPublicKey)
      ]);

      const result = {
        name: metadataResponse?.name || "Unknown Token",
        symbol: metadataResponse?.symbol || "UNKNOWN",
        decimals: metadataResponse?.decimals || 9,
        logoURI: metadataResponse?.logoURI,
        supply: supplyResponse,
      };

      console.log(`Helius metadata result for ${address}:`, result);
      return result;
    } catch (error) {
      console.warn(`Failed to fetch metadata for ${address}:`, error);
      return {
        name: "Unknown Token",
        symbol: "UNKNOWN",
        decimals: 9,
      };
    }
  }

  /**
   * Fetch token metadata from Helius
   */
  private async fetchHeliusMetadata(address: string): Promise<any> {
    try {
      const response = await fetch(this.connection.rpcEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'helius-metadata',
          method: 'getAsset',
          params: {
            id: address,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Helius metadata error: ${response.status}`);
      }

      const data = await response.json();

      if (data.result) {
        return {
          name: data.result.content?.metadata?.name,
          symbol: data.result.content?.metadata?.symbol,
          decimals: data.result.token_info?.decimals,
          logoURI: data.result.content?.files?.[0]?.uri,
        };
      }

      return null;
    } catch (error) {
      console.warn(`Helius metadata failed for ${address}:`, error);
      return null;
    }
  }

  /**
   * Get token supply from Solana RPC
   */
  private async fetchTokenSupply(mintPublicKey: PublicKey): Promise<number | null> {
    try {
      const supply = await this.connection.getTokenSupply(mintPublicKey);
      return supply.value.uiAmount;
    } catch (error) {
      console.warn(`Failed to fetch token supply:`, error);
      return null;
    }
  }

  /**
   * Combine data from DexScreener and Helius metadata into a unified TokenData object
   */
  private combineTokenData(
    address: string,
    dexScreenerResult: PromiseSettledResult<DexScreenerPair | null>,
    metadataResult: PromiseSettledResult<TokenMetadata>
  ): TokenData {
    // Extract DexScreener data
    const dexScreenerPair = dexScreenerResult.status === 'fulfilled' ? dexScreenerResult.value : null;

    // Extract Helius metadata
    const metadata = metadataResult.status === 'fulfilled' ? metadataResult.value : {
      name: "Unknown Token",
      symbol: "UNKNOWN",
      decimals: 9,
    };

    // Prioritize Helius metadata over DexScreener for token info (more accurate)
    const name = metadata.name !== "Unknown Token" ? metadata.name : (dexScreenerPair?.baseToken.name || metadata.name);
    const symbol = metadata.symbol !== "UNKNOWN" ? metadata.symbol : (dexScreenerPair?.baseToken.symbol || metadata.symbol);

    // Use DexScreener for price and trading data
    const price = dexScreenerPair ? parseFloat(dexScreenerPair.priceUsd) : 0;
    const volume24h = dexScreenerPair?.volume?.h24 || 0;
    const priceChange24h = dexScreenerPair?.priceChange?.h24 || 0;

    // Calculate market cap using Helius supply data if available, otherwise use DexScreener
    let marketCap = dexScreenerPair?.marketCap || 0;
    if (metadata.supply && price > 0) {
      // Use real-time supply from Helius for more accurate market cap
      marketCap = price * metadata.supply;
      console.log(`Calculated market cap using Helius supply: ${marketCap} (price: ${price}, supply: ${metadata.supply})`);
    }

    console.log(`Combined token data for ${address}:`, {
      price,
      name,
      symbol,
      marketCap,
      volume24h,
      priceChange24h,
      supply: metadata.supply,
      heliusMetadata: metadata.name !== "Unknown Token",
      dexScreenerPair: !!dexScreenerPair
    });

    return {
      address,
      name,
      symbol,
      price,
      priceChange24h,
      marketCap,
      volume24h,
      decimals: metadata.decimals,
      logoURI: metadata.logoURI,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get cached token data if still valid
   */
  private getCachedData(address: string): TokenData | null {
    const cached = this.cache.get(address);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache token data with timestamp
   */
  private setCachedData(address: string, data: TokenData): void {
    this.cache.set(address, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.CACHE_DURATION) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Validate if a token address is valid Solana format
   */
  static isValidTokenAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const tokenChartService = new TokenChartService();