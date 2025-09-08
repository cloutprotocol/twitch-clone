import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.SOLANA_RPC_URL;

if (!SOLANA_RPC_URL) {
  console.warn("No Solana RPC URL configured");
}

export interface WalletBalance {
  sol: number;
  usd: number;
  lamports: number;
}

export async function getWalletBalance(walletAddress: string): Promise<WalletBalance> {
  if (!SOLANA_RPC_URL) {
    throw new Error("Solana RPC URL not configured");
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL);
    const publicKey = new PublicKey(walletAddress);
    
    // Get balance in lamports
    const lamports = await connection.getBalance(publicKey);
    const sol = lamports / LAMPORTS_PER_SOL;
    
    // Get SOL price from our API endpoint
    let usd = 0;
    try {
      const priceResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/wallet/sol-price`);
      const priceData = await priceResponse.json();
      const solPrice = priceData.price || 0;
      usd = sol * solPrice;
    } catch (error) {
      console.warn("Failed to fetch SOL price:", error);
    }
    
    return {
      sol,
      usd,
      lamports,
    };
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    throw error;
  }
}

export function formatBalance(balance: WalletBalance): {
  solFormatted: string;
  usdFormatted: string;
} {
  return {
    solFormatted: balance.sol.toFixed(3),
    usdFormatted: balance.usd.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  };
}

export function calculateLaunchCost(initialBuySOL: number): {
  initialBuy: number;
  transactionFees: number;
  total: number;
} {
  const transactionFees = 0.05; // Estimated transaction fees in SOL
  
  return {
    initialBuy: initialBuySOL,
    transactionFees,
    total: initialBuySOL + transactionFees,
  };
}