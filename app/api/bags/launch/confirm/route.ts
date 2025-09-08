import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { Connection, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

if (!SOLANA_RPC_URL) {
  throw new Error("SOLANA_RPC_URL is required");
}

const connection = new Connection(SOLANA_RPC_URL);

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();
    if (!self) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { signedTransaction, tokenMint, tokenMetadata } = await req.json();

    if (!signedTransaction) {
      return NextResponse.json({ 
        error: "Missing signed transaction" 
      }, { status: 400 });
    }

    // Send the signed transaction
    console.log("📡 Sending signed transaction...");
    
    const txBuffer = bs58.decode(signedTransaction);
    const transaction = VersionedTransaction.deserialize(txBuffer);
    
    const signature = await connection.sendTransaction(transaction, {
      skipPreflight: true,
      maxRetries: 0,
    });
    
    // Wait for confirmation
    const blockhash = await connection.getLatestBlockhash("processed");
    const confirmation = await connection.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature: signature,
    }, "processed");
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    console.log("✅ Transaction confirmed:", signature);

    return NextResponse.json({
      success: true,
      signature,
      tokenMint,
      tokenMetadata,
      explorerUrl: `https://solscan.io/tx/${signature}`,
      bagsUrl: `https://bags.fm/${tokenMint}`,
    });

  } catch (error) {
    console.error("Transaction confirmation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to confirm transaction" 
    }, { status: 500 });
  }
}