import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";
import { BagsSDK } from "@bagsfm/bags-sdk";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

// Initialize SDK
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

    const formData = await req.formData();
    
    // Extract form data
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;
    const launchType = formData.get("launchType") as string;
    const twitterUsername = formData.get("twitterUsername") as string;
    const creatorFeeBps = parseInt(formData.get("creatorFeeBps") as string) || 1000;
    const twitterUserFeeBps = parseInt(formData.get("twitterUserFeeBps") as string) || 9000;
    const initialBuySOL = parseFloat(formData.get("initialBuySOL") as string) || 0.01;
    const websiteLink = formData.get("websiteLink") as string;
    const twitterLink = formData.get("twitterLink") as string;
    const telegramLink = formData.get("telegramLink") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const signedTransaction = formData.get("signedTransaction") as string;

    // Validate required fields
    if (!name || !symbol || !description || !walletAddress) {
      return NextResponse.json({ 
        error: "Missing required fields: name, symbol, description, walletAddress" 
      }, { status: 400 });
    }

    // Validate wallet address
    let launchWallet: PublicKey;
    try {
      launchWallet = new PublicKey(walletAddress);
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid wallet address" 
      }, { status: 400 });
    }

    // Step 1: Create token info and metadata
    console.log("📝 Creating token info and metadata...");
    
    const tokenInfo = await sdk.tokenLaunch.createTokenInfoAndMetadata({
      image: image || undefined,
      name,
      symbol,
      description,
      telegram: telegramLink || undefined,
      twitter: twitterLink || undefined,
      website: websiteLink || undefined,
    });
    
    console.log("✨ Successfully created token info and metadata!");
    console.log("🪙 Token mint:", tokenInfo.tokenMint);

    // Default config key (you might need to get this from the SDK or use a specific default)
    let configKey: PublicKey = PublicKey.default;

    // Step 2: Handle fee sharing if enabled
    if (launchType === "twitter-fee-sharing" && twitterUsername) {
      console.log("⚙️ Setting up fee sharing configuration...");
      
      // Get fee share wallet
      let feeShareWallet: PublicKey;
      try {
        feeShareWallet = await sdk.state.getLaunchWalletForTwitterUsername(twitterUsername);
        if (!feeShareWallet) {
          return NextResponse.json({ 
            error: `Could not find fee share wallet for Twitter user @${twitterUsername}. They need to connect their wallet at bags.fm first.` 
          }, { status: 400 });
        }
      } catch (error) {
        console.error("Fee share wallet lookup error:", error);
        return NextResponse.json({ 
          error: `Failed to lookup fee share wallet for @${twitterUsername}. Please verify the username is correct.` 
        }, { status: 400 });
      }

      // Create fee share config
      const feeShareConfig = await sdk.config.createFeeShareConfig({
        users: [{
          wallet: launchWallet,
          bps: creatorFeeBps,
        }, {
          wallet: feeShareWallet,
          bps: twitterUserFeeBps,
        }],
        payer: launchWallet,
        baseMint: new PublicKey(tokenInfo.tokenMint),
        quoteMint: new PublicKey("So11111111111111111111111111111111111111112"), // wSOL mint
      });

      configKey = feeShareConfig.configKey;

      // If there's a config transaction, return it for signing
      if (feeShareConfig.transaction) {
        const serializedTx = bs58.encode(feeShareConfig.transaction.serialize());
        return NextResponse.json({
          step: "config",
          transaction: serializedTx,
          configKey: configKey.toString(),
          tokenMint: tokenInfo.tokenMint,
          tokenMetadata: tokenInfo.tokenMetadata,
        });
      }
    }

    // Step 3: Create launch transaction
    console.log("🎯 Creating token launch transaction...");
    
    const launchTx = await sdk.tokenLaunch.createLaunchTransaction({
      metadataUrl: tokenInfo.tokenMetadata,
      tokenMint: new PublicKey(tokenInfo.tokenMint),
      launchWallet: launchWallet,
      initialBuyLamports: Math.floor(initialBuySOL * 1000000000), // Convert SOL to lamports
      configKey: configKey,
    });

    // Return the transaction for client-side signing
    const serializedTx = bs58.encode(launchTx.serialize());
    
    return NextResponse.json({
      step: "launch",
      transaction: serializedTx,
      tokenMint: tokenInfo.tokenMint,
      tokenMetadata: tokenInfo.tokenMetadata,
      configKey: configKey?.toString(),
    });

  } catch (error) {
    console.error("Token launch error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to launch token" 
    }, { status: 500 });
  }
}