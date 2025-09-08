import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export class BagsSDKClient {
  private apiKey: string;
  private rpcUrl: string;

  constructor() {
    this.apiKey = process.env.BAGS_API_KEY!;
    this.rpcUrl = process.env.SOLANA_RPC_URL!;
  }

  /**
   * Create a keypair from a base58 encoded private key
   */
  createKeypairFromPrivateKey(privateKey: string): Keypair {
    try {
      const secretKey = bs58.decode(privateKey);
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      throw new Error("Invalid private key format");
    }
  }

  /**
   * Get fee share wallet for a Twitter username
   */
  async getFeeShareWallet(twitterUsername: string): Promise<string | null> {
    try {
      // Import the function directly from the SDK like the external implementation
      const { getFeeShareWallet } = await import("@bagsfm/bags-sdk");
      
      return await getFeeShareWallet(twitterUsername);
    } catch (error) {
      console.error("Error getting fee share wallet:", error);
      return null;
    }
  }

  /**
   * Launch a standard token without fee sharing
   */
  async launchTokenStandard(params: {
    imageUrl: string;
    name: string;
    symbol: string;
    description: string;
    telegram?: string;
    twitter?: string;
    website?: string;
    initialBuySOL?: number;
    privateKey: string;
  }) {
    try {
      // Import the functions directly from the SDK like the external implementation
      const { launchTokenStandard } = await import("@bagsfm/bags-sdk");
      
      // Set the private key in environment for the SDK to use
      process.env.PRIVATE_KEY = params.privateKey;

      return await launchTokenStandard(
        params.imageUrl,
        params.name,
        params.symbol,
        params.description,
        params.telegram,
        params.twitter,
        params.website,
        params.initialBuySOL || 0.01
      );
    } catch (error) {
      console.error("Error launching standard token:", error);
      throw error;
    } finally {
      // Clean up the private key from environment
      delete process.env.PRIVATE_KEY;
    }
  }

  /**
   * Launch a token with fee sharing
   */
  async launchTokenWithSharedFees(params: {
    imageUrl: string;
    name: string;
    symbol: string;
    description: string;
    feeClaimerTwitterHandle: string;
    creatorFeeBps?: number;
    feeClaimerFeeBps?: number;
    initialBuySOL?: number;
    telegram?: string;
    twitter?: string;
    website?: string;
    privateKey: string;
  }) {
    try {
      // Import the functions directly from the SDK like the external implementation
      const { launchTokenWithSharedFees } = await import("@bagsfm/bags-sdk");
      
      // Set the private key in environment for the SDK to use
      process.env.PRIVATE_KEY = params.privateKey;

      return await launchTokenWithSharedFees(
        params.imageUrl,
        params.name,
        params.symbol,
        params.description,
        params.feeClaimerTwitterHandle,
        params.creatorFeeBps || 1000,
        params.feeClaimerFeeBps || 9000,
        params.initialBuySOL || 0.01,
        params.telegram,
        params.twitter,
        params.website
      );
    } catch (error) {
      console.error("Error launching token with fee sharing:", error);
      throw error;
    } finally {
      // Clean up the private key from environment
      delete process.env.PRIVATE_KEY;
    }
  }
}

export const bagsSDK = new BagsSDKClient();