import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { BagsSDK } from "@bagsfm/bags-sdk";
import {
    Keypair,
    VersionedTransaction,
    LAMPORTS_PER_SOL,
    PublicKey,
    Connection,
} from "@solana/web3.js";
import bs58 from "bs58";

// Initialize SDK
const BAGS_API_KEY = process.env.BAGS_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!BAGS_API_KEY || !SOLANA_RPC_URL || !PRIVATE_KEY) {
    throw new Error("BAGS_API_KEY, SOLANA_RPC_URL, and PRIVATE_KEY are required");
}

const connection = new Connection(SOLANA_RPC_URL);
const sdk = new BagsSDK(BAGS_API_KEY, connection, "processed");
// Default initial buy - can be overridden in function calls
const DEFAULT_INITIAL_BUY_LAMPORTS = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL

/**
 * Sign and send a transaction using the provided keypair
 */
async function signAndSendTransaction(serializedTx, keypair) {
    const connection = sdk.state.getConnection();
    const commitment = sdk.state.getCommitment();
    
    const txBuffer = bs58.decode(serializedTx);
    const transaction = VersionedTransaction.deserialize(txBuffer);
    
    transaction.sign([keypair]);
    
    const blockhash = await connection.getLatestBlockhash(commitment);
    const signature = await connection.sendTransaction(transaction, {
        skipPreflight: true,
        maxRetries: 0,
    });
    
    const confirmation = await connection.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: signature,
    }, commitment);
    
    if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }
    
    console.log("✅ Transaction confirmed:", signature);
    return signature;
}

/**
 * Get fee share wallet for a Twitter username
 */
async function getFeeShareWallet(twitterUsername) {
    try {
        console.log(`🔍 Looking up fee share wallet for Twitter user: @${twitterUsername}`);
        const feeShareWallet = await sdk.state.getLaunchWalletForTwitterUsername(twitterUsername);
        console.log(`✨ Found fee share wallet: ${feeShareWallet.toString()}`);
        return feeShareWallet;
    } catch (error) {
        console.error(`❌ Failed to get fee share wallet for @${twitterUsername}:`, error);
        return null;
    }
}

/**
 * Launch a token with shared fees using the Bags SDK
 */
export async function launchTokenWithSharedFees(
    imageUrl,
    name,
    symbol,
    description,
    feeClaimerTwitterHandle,
    creatorFeeBps = 1000,  // 10% for creator
    feeClaimerFeeBps = 9000, // 90% for fee claimer
    initialBuySOL = 0.01,  // Initial buy amount in SOL
    telegram,
    twitter,
    website
) {
    try {
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        
        console.log(`🚀 Creating token $${symbol} with shared fees using wallet ${keypair.publicKey.toBase58()}`);
        console.log(`📝 Token: ${name} (${symbol})`);
        console.log(`📄 Description: ${description}`);
        console.log(`👤 Fee Claimer: @${feeClaimerTwitterHandle}`);
        console.log(`💰 Fee Split: Creator ${creatorFeeBps / 100}% | Fee Claimer ${feeClaimerFeeBps / 100}%`);
        console.log(`💵 Initial Buy: ${initialBuySOL} SOL`);

        // Step 1: Create token info and metadata
        console.log("📝 Creating token info and metadata...");
        
        // Fetch image url to file-like object
        const image = await fetch(imageUrl).then(res => res.blob());
        
        const tokenInfo = await sdk.tokenLaunch.createTokenInfoAndMetadata({
            image,
            name,
            symbol,
            description,
            telegram,
            twitter,
            website,
        });
        
        console.log("✨ Successfully created token info and metadata!");
        console.log("🪙 Token mint:", tokenInfo.tokenMint);

        // Step 2: Get fee share wallet (required for shared fees)
        if (!feeClaimerTwitterHandle) {
            throw new Error("Fee claimer Twitter handle is required for shared fees");
        }
        
        const feeShareWallet = await getFeeShareWallet(feeClaimerTwitterHandle);
        if (!feeShareWallet) {
            throw new Error(`Could not find fee share wallet for Twitter user @${feeClaimerTwitterHandle}`);
        }

        // Step 3: Create launch config with shared fees
        console.log("⚙️  Creating launch config with shared fees...");
        
        const feeShareConfig = await sdk.config.createFeeShareConfig({
            users: [{
                wallet: keypair.publicKey,
                bps: creatorFeeBps,
            }, {
                wallet: feeShareWallet,
                bps: feeClaimerFeeBps,
            }],
            payer: keypair.publicKey,
            baseMint: new PublicKey(tokenInfo.tokenMint),
            quoteMint: new PublicKey("So11111111111111111111111111111111111111112"), // wSOL mint
        });

        const configResult = {
            configKey: feeShareConfig.configKey.toString(),
            tx: feeShareConfig.transaction ? bs58.encode(feeShareConfig.transaction.serialize()) : null,
        };

        console.log("🔧 Launch config created successfully!");
        
        if (configResult.tx) {
            console.log("🔐 Signing and sending config transaction...");
            await signAndSendTransaction(configResult.tx, keypair);
        } else {
            console.log("♻️  Config already exists, reusing existing configuration");
        }

        const configKey = configResult.configKey;
        console.log("🔑 Config Key:", configKey);

        // Step 4: Create launch transaction
        console.log("🎯 Creating token launch transaction...");
        
        const launchTx = await sdk.tokenLaunch.createLaunchTransaction({
            metadataUrl: tokenInfo.tokenMetadata,
            tokenMint: new PublicKey(tokenInfo.tokenMint),
            launchWallet: keypair.publicKey,
            initialBuyLamports: Math.floor(initialBuySOL * LAMPORTS_PER_SOL),
            configKey: new PublicKey(configKey),
        });

        // Step 5: Send final transaction
        console.log("📡 Sending final transaction...");
        const finalSignature = await signAndSendTransaction(
            bs58.encode(launchTx.serialize()), 
            keypair
        );

        console.log("🎉 Token launched successfully!");
        console.log("🪙 Token Mint:", tokenInfo.tokenMint);
        console.log("🔑 Launch Signature:", finalSignature);
        console.log("📄 Metadata URI:", tokenInfo.tokenMetadata);
        console.log("💰 Shared Fees Configuration:");
        console.log(`  👤 Creator (${keypair.publicKey.toString()}): ${creatorFeeBps / 100}%`);
        console.log(`  🤝 Fee Claimer (${feeShareWallet.toString()}): ${feeClaimerFeeBps / 100}%`);
        console.log(`🌐 View your token at: https://bags.fm/${tokenInfo.tokenMint}`);

        return {
            tokenMint: tokenInfo.tokenMint,
            signature: finalSignature,
            tokenMetadata: tokenInfo.tokenMetadata,
            tokenLaunch: tokenInfo.tokenLaunch,
            feeShareWallet: feeShareWallet.toString(),
            feeSplit: {
                creator: creatorFeeBps,
                feeClaimer: feeClaimerFeeBps,
            },
        };

    } catch (error) {
        console.error("🚨 Token launch failed:", error);
        throw error;
    }
}

/**
 * Launch a token without fee sharing (standard launch)
 */
export async function launchTokenStandard(
    imageUrl,
    name,
    symbol,
    description,
    telegram,
    twitter,
    website,
    initialBuySOL = 0.01
) {
    try {
        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        
        console.log(`🚀 Creating standard token $${symbol} using wallet ${keypair.publicKey.toBase58()}`);
        console.log(`📝 Token: ${name} (${symbol})`);
        console.log(`📄 Description: ${description}`);
        console.log(`💰 Initial Buy: ${initialBuySOL} SOL`);

        // Step 1: Create token info and metadata
        console.log("📝 Creating token info and metadata...");
        
        const image = await fetch(imageUrl).then(res => res.blob());
        
        const tokenInfo = await sdk.tokenLaunch.createTokenInfoAndMetadata({
            image,
            name,
            symbol,
            description,
            telegram,
            twitter,
            website,
        });
        
        console.log("✨ Successfully created token info and metadata!");
        console.log("🪙 Token mint:", tokenInfo.tokenMint);

        // Step 2: Create standard launch transaction (no fee sharing)
        console.log("🎯 Creating standard launch transaction...");
        
        const launchTx = await sdk.tokenLaunch.createLaunchTransaction({
            metadataUrl: tokenInfo.tokenMetadata,
            tokenMint: new PublicKey(tokenInfo.tokenMint),
            launchWallet: keypair.publicKey,
            initialBuyLamports: Math.floor(initialBuySOL * LAMPORTS_PER_SOL),
        });

        // Step 3: Send transaction
        console.log("📡 Sending launch transaction...");
        const signature = await signAndSendTransaction(
            bs58.encode(launchTx.serialize()), 
            keypair
        );

        console.log("🎉 Token launched successfully!");
        console.log("🪙 Token Mint:", tokenInfo.tokenMint);
        console.log("🔑 Launch Signature:", signature);
        console.log("📄 Metadata URI:", tokenInfo.tokenMetadata);
        console.log(`🌐 View your token at: https://bags.fm/${tokenInfo.tokenMint}`);

        return {
            tokenMint: tokenInfo.tokenMint,
            signature: signature,
            tokenMetadata: tokenInfo.tokenMetadata,
            tokenLaunch: tokenInfo.tokenLaunch,
        };

    } catch (error) {
        console.error("🚨 Token launch failed:", error);
        throw error;
    }
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
    // Example 1: Token with fee sharing
    launchTokenWithSharedFees(
        "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
        "My Shared Token",
        "MST",
        "This token has shared fees with a fee claimer!",
        "elonmusk", // Twitter username of the fee claimer
        1000,  // 10% for creator
        9000,  // 90% for fee claimer
        "https://t.me/mysharedtoken",
        "https://twitter.com/mysharedtoken",
        "https://mysharedtoken.com"
    ).then((result) => {
        console.log("🎊 Launch completed successfully!");
        console.log(`🌐 View your token at: https://bags.fm/${result.tokenMint}`);
    }).catch((error) => {
        console.error("🚨 Unexpected error occurred:", error);
    });
}