import { NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSelf();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the primary wallet or first wallet
    const primaryWallet = user.wallets.find(wallet => wallet.isPrimary) || user.wallets[0];

    if (!primaryWallet) {
      return NextResponse.json({ wallet: null });
    }

    return NextResponse.json({
      wallet: {
        id: primaryWallet.id,
        address: primaryWallet.address,
        chain: primaryWallet.chain,
        label: primaryWallet.label,
        isPrimary: primaryWallet.isPrimary,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user wallet:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}