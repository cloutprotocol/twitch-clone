import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { launchTokenWithSharedFees, launchTokenStandard } from './index.js';
import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create readline interface for interactive input
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

// Helper function to create blob from local file
async function createBlobFromFile(filePath) {
    try {
        const fullPath = resolve(__dirname, filePath);
        if (!existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }
        
        const fileBuffer = readFileSync(fullPath);
        const blob = new Blob([fileBuffer]);
        console.log(`✅ Loaded local file: ${filePath} (${blob.size} bytes)`);
        return blob;
    } catch (error) {
        console.error(`❌ Failed to load file: ${error.message}`);
        return null;
    }
}

// Enhanced interactive fee sharing with image options
async function enhancedFeeSharing() {
    console.log("\n🤝 Enhanced Fee Sharing Token Launch");
    console.log("====================================\n");

    const name = await askQuestion("Token name: ");
    const symbol = await askQuestion("Token symbol: ");
    const description = await askQuestion("Token description: ");
    
    // Image options
    console.log("\nImage options:");
    console.log("1. Use image URL");
    console.log("2. Use local image file");
    console.log("3. Use default image");
    
    const imageChoice = await askQuestion("Choose image option (1-3): ");
    let imageSource = null;
    
    switch (imageChoice) {
        case '1':
            imageSource = await askQuestion("Enter image URL: ");
            break;
        case '2':
            const filePath = await askQuestion("Enter local file path (relative to sdk folder): ");
            const blob = await createBlobFromFile(filePath);
            if (blob) {
                imageSource = blob;
            } else {
                console.log("⚠️  Using default image instead");
                imageSource = "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg";
            }
            break;
        case '3':
        default:
            imageSource = "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg";
            console.log("Using default image");
            break;
    }
    
    const initialBuy = await askQuestion("Initial buy amount in SOL (default 0.01): ");
    const twitterHandle = await askQuestion("Fee claimer Twitter handle (without @): ");
    
    console.log("\nFee split options:");
    console.log("1. 10/90 (Creator 10%, Claimer 90%) - Influencer Heavy");
    console.log("2. 20/80 (Creator 20%, Claimer 80%) - Influencer Focused");
    console.log("3. 50/50 (Equal split) - Partnership");
    console.log("4. 80/20 (Creator 80%, Claimer 20%) - Creator Heavy");
    console.log("5. 95/5 (Creator 95%, Claimer 5%) - Minimal Fee Share");
    console.log("6. Custom split");

    const feeChoice = await askQuestion("Choose fee split (1-6): ");
    
    let creatorBps, claimerBps;
    switch (feeChoice) {
        case '1':
            creatorBps = 1000; claimerBps = 9000;
            break;
        case '2':
            creatorBps = 2000; claimerBps = 8000;
            break;
        case '3':
            creatorBps = 5000; claimerBps = 5000;
            break;
        case '4':
            creatorBps = 8000; claimerBps = 2000;
            break;
        case '5':
            creatorBps = 9500; claimerBps = 500;
            break;
        case '6':
            const creatorPercent = await askQuestion("Creator percentage (0-100): ");
            creatorBps = parseInt(creatorPercent) * 100;
            claimerBps = 10000 - creatorBps;
            if (creatorBps < 0 || creatorBps > 10000 || claimerBps < 0) {
                console.log("Invalid percentage, using 10/90 split");
                creatorBps = 1000; claimerBps = 9000;
            }
            break;
        default:
            creatorBps = 1000; claimerBps = 9000;
    }

    const telegram = await askQuestion("Telegram link (optional): ");
    const twitter = await askQuestion("Twitter link (optional): ");
    const website = await askQuestion("Website link (optional): ");

    console.log("\n📋 Launch Summary:");
    console.log("==================");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Description:", description);
    console.log("Image:", typeof imageSource === 'string' ? imageSource : 'Local file');
    console.log("Initial Buy:", initialBuy || "0.01", "SOL");
    console.log("Fee Claimer:", `@${twitterHandle}`);
    console.log("Fee Split:", `Creator ${creatorBps/100}% | Claimer ${claimerBps/100}%`);
    console.log("Links:", { 
        telegram: telegram || 'None', 
        twitter: twitter || 'None', 
        website: website || 'None' 
    });

    const confirm = await askQuestion("\nProceed with launch? (y/N): ");
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        console.log("\n🚀 Launching token...\n");
        
        try {
            const result = await launchTokenWithSharedFees(
                imageSource,
                name,
                symbol,
                description,
                twitterHandle,
                creatorBps,
                claimerBps,
                parseFloat(initialBuy) || 0.01,
                telegram || undefined,
                twitter || undefined,
                website || undefined
            );

            console.log("\n🎉 Token launched successfully!");
            console.log("🪙 Token Mint:", result.tokenMint);
            console.log("🔑 Signature:", result.signature);
            console.log("🌐 View at: https://bags.fm/" + result.tokenMint);
            console.log("💰 Fee Split:", `${creatorBps/100}%/${claimerBps/100}%`);
            console.log("🤝 Fee Claimer Wallet:", result.feeShareWallet);
            
        } catch (error) {
            console.error("❌ Launch failed:", error.message);
            if (error.message.includes('Twitter user')) {
                console.log("💡 Tip: Make sure the Twitter username has a registered Bags wallet");
            }
        }
    } else {
        console.log("Launch cancelled.");
    }
}

// Enhanced standard launch
async function enhancedStandardLaunch() {
    console.log("\n🪙 Enhanced Standard Token Launch");
    console.log("=================================\n");

    const name = await askQuestion("Token name: ");
    const symbol = await askQuestion("Token symbol: ");
    const description = await askQuestion("Token description: ");
    
    // Image options
    console.log("\nImage options:");
    console.log("1. Use image URL");
    console.log("2. Use local image file");
    console.log("3. Use default image");
    
    const imageChoice = await askQuestion("Choose image option (1-3): ");
    let imageSource = null;
    
    switch (imageChoice) {
        case '1':
            imageSource = await askQuestion("Enter image URL: ");
            break;
        case '2':
            const filePath = await askQuestion("Enter local file path (relative to sdk folder): ");
            const blob = await createBlobFromFile(filePath);
            if (blob) {
                imageSource = blob;
            } else {
                console.log("⚠️  Using default image instead");
                imageSource = "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg";
            }
            break;
        case '3':
        default:
            imageSource = "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg";
            console.log("Using default image");
            break;
    }
    
    const initialBuy = await askQuestion("Initial buy amount in SOL (default 0.01): ");
    
    const telegram = await askQuestion("Telegram link (optional): ");
    const twitter = await askQuestion("Twitter link (optional): ");
    const website = await askQuestion("Website link (optional): ");

    console.log("\n📋 Launch Summary:");
    console.log("==================");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Description:", description);
    console.log("Image:", typeof imageSource === 'string' ? imageSource : 'Local file');
    console.log("Initial Buy:", initialBuy || "0.01", "SOL");
    console.log("Links:", { 
        telegram: telegram || 'None', 
        twitter: twitter || 'None', 
        website: website || 'None' 
    });

    const confirm = await askQuestion("\nProceed with launch? (y/N): ");
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        console.log("\n🚀 Launching token...\n");
        
        try {
            const result = await launchTokenStandard(
                imageSource,
                name,
                symbol,
                description,
                telegram || undefined,
                twitter || undefined,
                website || undefined,
                parseFloat(initialBuy) || 0.01
            );

            console.log("\n🎉 Token launched successfully!");
            console.log("🪙 Token Mint:", result.tokenMint);
            console.log("🔑 Signature:", result.signature);
            console.log("🌐 View at: https://bags.fm/" + result.tokenMint);
            
        } catch (error) {
            console.error("❌ Launch failed:", error.message);
        }
    } else {
        console.log("Launch cancelled.");
    }
}

// Main interactive mode
async function interactiveMode() {
    console.log("🚀 Enhanced Bags SDK Interactive Mode");
    console.log("=====================================\n");

    try {
        // Check environment
        if (!process.env.BAGS_API_KEY) {
            console.log("❌ BAGS_API_KEY not found in .env file");
            process.exit(1);
        }

        if (!process.env.PRIVATE_KEY) {
            console.log("⚠️  PRIVATE_KEY not found in .env file");
            console.log("Please add your wallet's private key to .env file");
            process.exit(1);
        }

        console.log("✅ Environment configured");
        console.log("🔑 API Key:", process.env.BAGS_API_KEY.substring(0, 20) + "...");
        console.log("💼 Wallet configured\n");

        // Ask what to do
        console.log("What would you like to do?");
        console.log("1. Launch token with fee sharing (enhanced)");
        console.log("2. Launch standard token (enhanced)");
        console.log("3. Exit");

        const choice = await askQuestion("\nEnter your choice (1-3): ");

        switch (choice) {
            case '1':
                await enhancedFeeSharing();
                break;
            case '2':
                await enhancedStandardLaunch();
                break;
            case '3':
                console.log("Goodbye! 👋");
                break;
            default:
                console.log("Invalid choice. Exiting...");
        }

    } catch (error) {
        console.error("❌ Interactive mode error:", error.message);
    } finally {
        rl.close();
    }
}

// Start interactive mode
if (import.meta.url === `file://${process.argv[1]}`) {
    interactiveMode().catch(console.error);
}

export { interactiveMode, enhancedFeeSharing, enhancedStandardLaunch };