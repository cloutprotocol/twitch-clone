import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { getWalletBalance } from "@/lib/wallet-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await getSelf();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the primary wallet or first wallet
    const primaryWallet = user.wallets.find(wallet => wallet.isPrimary) || user.wallets[0];

    if (!primaryWallet) {
      return NextResponse.json({ error: "No wallet found" }, { status: 404 });
    }

    // Fetch balance from blockchain
    const balance = await getWalletBalance(primaryWallet.address);

    return NextResponse.json({
      wallet: {
        address: primaryWallet.address,
        chain: primaryWallet.chain,
        label: primaryWallet.label,
      },
      balance,
    });
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    return NextResponse.json({ 
      error: "Failed to fetch balance" 
    }, { status: 500 });
  }
}

// Allow refresh of balance
export async function POST(req: NextRequest) {
  return GET(req);
}