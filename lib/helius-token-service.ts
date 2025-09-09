import { Connection, PublicKey } from "@solana/web3.js";

export interface HeliusTokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  logoURI?: string;
  lastUpdated: number;
}

export class HeliusTokenService {
  private connection: Connection;
  private cache = new Map<string, { data: HeliusTokenData; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      throw new Error("Solana RPC URL not configured");
    }
    this.connection = new Connection(rpcUrl);
  }

  async getTokenData(address: string): Promise<HeliusTokenData> {
    // Check cache first
    const cached = this.cache.get(address);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`[HeliusTokenService] Returning cached data for: ${address}`);
      return cached.data;
    }

    console.log(`[HeliusTokenService] Fetching fresh data for: ${address}`);

    try {
      const [metadata, supply] = await Promise.all([
        this.fetchTokenMetadata(address),
        this.fetchTokenSupply(address)
      ]);

      const tokenData: HeliusTokenData = {
        address,
        name: metadata?.name || "Unknown Token",
        symbol: metadata?.symbol || "UNKNOWN",
        decimals: metadata?.decimals || 9,
        supply: supply || 0,
        logoURI: metadata?.logoURI,
        lastUpdated: Date.now(),
      };

      // Cache the result
      this.cache.set(address, {
        data: tokenData,
        timestamp: Date.now(),
      });

      console.log(`[HeliusTokenService] Successfully fetched data for ${address}:`, tokenData);
      return tokenData;

    } catch (error) {
      console.error(`[HeliusTokenService] Error fetching data for ${address}:`, error);
      throw error;
    }
  }

  private async fetchTokenMetadata(address: string): Promise<any> {
    try {
      console.log(`[HeliusTokenService] Fetching metadata for: ${address}`);
      
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
      console.log(`[HeliusTokenService] Metadata response for ${address}:`, data);
      
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
      console.warn(`[HeliusTokenService] Metadata fetch failed for ${address}:`, error);
      return null;
    }
  }

  private async fetchTokenSupply(address: string): Promise<number | null> {
    try {
      console.log(`[HeliusTokenService] Fetching supply for: ${address}`);
      
      const mintPublicKey = new PublicKey(address);
      const supply = await this.connection.getTokenSupply(mintPublicKey);
      
      console.log(`[HeliusTokenService] Supply for ${address}:`, supply.value.uiAmount);
      return supply.value.uiAmount;
    } catch (error) {
      console.warn(`[HeliusTokenService] Supply fetch failed for ${address}:`, error);
      return null;
    }
  }

  static isValidTokenAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

export const heliusTokenService = new HeliusTokenService();