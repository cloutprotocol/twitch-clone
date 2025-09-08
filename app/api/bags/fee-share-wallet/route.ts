import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { BagsSDK } from "@bagsfm/bags-sdk";
import { Connection } from "@solana/web3.js";

// Initialize SDK with Helius
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

if (!BAGS_API_KEY || !SOLANA_RPC_URL) {
  throw new Error("BAGS_API_KEY and SOLANA_RPC_URL are required");
}

const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();
    if (!self) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ 
        error: "Twitter username is required" 
      }, { status: 400 });
    }

    console.log(`🔍 Looking up fee share wallet for Twitter user: @${username}`);

    try {
      const feeShareWallet = await sdk.state.getLaunchWalletForTwitterUsername(username);
      
      if (feeShareWallet) {
        console.log(`✨ Found fee share wallet: ${feeShareWallet.toString()}`);
        return NextResponse.json({
          wallet: feeShareWallet.toString(),
          username: username,
        });
      } else {
        console.log(`❌ No fee share wallet found for @${username}`);
        return NextResponse.json({
          wallet: null,
          username: username,
          message: `No fee share wallet found for @${username}. They need to connect their wallet at bags.fm first.`,
        });
      }
    } catch (error) {
      console.error(`❌ Failed to get fee share wallet for @${username}:`, error);
      return NextResponse.json({ 
        error: `Failed to lookup fee share wallet for @${username}. Please verify the username is correct.` 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Fee share wallet lookup error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to lookup fee share wallet" 
    }, { status: 500 });
  }
}