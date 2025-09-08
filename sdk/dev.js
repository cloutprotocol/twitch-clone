import dotenv from "dotenv";
dotenv.config({ quiet: true });

import { launchTokenWithSharedFees, launchTokenStandard } from './index.js';
import { createInterface } from 'readline';

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

// Development mode with interactive prompts
async function devMode() {
    console.log("🚀 Bags SDK Development Mode");
    console.log("============================\n");

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
        console.log("1. Launch token with fee sharing");
        console.log("2. Launch standard token (no fee sharing)");
        console.log("3. Run tests");
        console.log("4. Run examples");
        console.log("5. Quick test launch");

        const choice = await askQuestion("\nEnter your choice (1-5): ");

        switch (choice) {
            case '1':
                await interactiveFeeSharing();
                break;
            case '2':
                await interactiveStandardLaunch();
                break;
            case '3':
                await runTests();
                break;
            case '4':
                await runExamples();
                break;
            case '5':
                await quickTestLaunch();
                break;
            default:
                console.log("Invalid choice. Exiting...");
        }

    } catch (error) {
        console.error("❌ Development mode error:", error.message);
    } finally {
        rl.close();
    }
}

// Interactive fee sharing launch
async function interactiveFeeSharing() {
    console.log("\n🤝 Interactive Fee Sharing Token Launch");
    console.log("======================================\n");

    const name = await askQuestion("Token name: ");
    const symbol = await askQuestion("Token symbol: ");
    const description = await askQuestion("Token description: ");
    const imageUrl = await askQuestion("Image URL (or press Enter for default): ");
    const initialBuy = await askQuestion("Initial buy amount in SOL (default 0.01): ");
    const twitterHandle = await askQuestion("Fee claimer Twitter handle (without @): ");
    
    console.log("\nFee split options:");
    console.log("1. 10/90 (Creator 10%, Claimer 90%)");
    console.log("2. 20/80 (Creator 20%, Claimer 80%)");
    console.log("3. 50/50 (Equal split)");
    console.log("4. 80/20 (Creator 80%, Claimer 20%)");
    console.log("5. Custom");

    const feeChoice = await askQuestion("Choose fee split (1-5): ");
    
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
            const creatorPercent = await askQuestion("Creator percentage (0-100): ");
            creatorBps = parseInt(creatorPercent) * 100;
            claimerBps = 10000 - creatorBps;
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
    console.log("Image URL:", imageUrl || "Default");
    console.log("Initial Buy:", initialBuy || "0.01", "SOL");
    console.log("Fee Claimer:", `@${twitterHandle}`);
    console.log("Fee Split:", `${creatorBps/100}% / ${claimerBps/100}%`);
    console.log("Links:", { telegram, twitter, website });

    const confirm = await askQuestion("\nProceed with launch? (y/N): ");
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        console.log("\n🚀 Launching token...\n");
        
        try {
            const result = await launchTokenWithSharedFees(
                imageUrl || "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
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
            console.log("🌐 View at: https://bags.fm/" + result.tokenMint);
            
        } catch (error) {
            console.error("❌ Launch failed:", error.message);
        }
    } else {
        console.log("Launch cancelled.");
    }
}

// Interactive standard launch
async function interactiveStandardLaunch() {
    console.log("\n🪙 Interactive Standard Token Launch");
    console.log("===================================\n");

    const name = await askQuestion("Token name: ");
    const symbol = await askQuestion("Token symbol: ");
    const description = await askQuestion("Token description: ");
    const imageUrl = await askQuestion("Image URL (or press Enter for default): ");
    const initialBuy = await askQuestion("Initial buy amount in SOL (default 0.01): ");
    
    const telegram = await askQuestion("Telegram link (optional): ");
    const twitter = await askQuestion("Twitter link (optional): ");
    const website = await askQuestion("Website link (optional): ");

    console.log("\n📋 Launch Summary:");
    console.log("==================");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Description:", description);
    console.log("Image URL:", imageUrl || "Default");
    console.log("Initial Buy:", initialBuy || "0.01", "SOL");
    console.log("Links:", { telegram, twitter, website });

    const confirm = await askQuestion("\nProceed with launch? (y/N): ");
    
    if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        console.log("\n🚀 Launching token...\n");
        
        try {
            const result = await launchTokenStandard(
                imageUrl || "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
                name,
                symbol,
                description,
                telegram || undefined,
                twitter || undefined,
                website || undefined,
                parseFloat(initialBuy) || 0.01
            );

            console.log("\n🎉 Token launched successfully!");
            console.log("🌐 View at: https://bags.fm/" + result.tokenMint);
            
        } catch (error) {
            console.error("❌ Launch failed:", error.message);
        }
    } else {
        console.log("Launch cancelled.");
    }
}

// Quick test launch
async function quickTestLaunch() {
    console.log("\n⚡ Quick Test Launch");
    console.log("===================\n");
    
    const testTokens = [
        {
            name: "Test Fee Share Token",
            symbol: "TFST",
            description: "Quick test token with fee sharing",
            twitterHandle: "elonmusk",
            type: "feeshare"
        },
        {
            name: "Test Standard Token", 
            symbol: "TST",
            description: "Quick test standard token",
            type: "standard"
        }
    ];

    console.log("Choose a quick test:");
    testTokens.forEach((token, i) => {
        console.log(`${i + 1}. ${token.name} (${token.type})`);
    });

    const choice = await askQuestion("Enter choice (1-2): ");
    const selectedToken = testTokens[parseInt(choice) - 1];

    if (!selectedToken) {
        console.log("Invalid choice");
        return;
    }

    console.log(`\n🚀 Launching ${selectedToken.name}...\n`);

    try {
        let result;
        if (selectedToken.type === 'feeshare') {
            result = await launchTokenWithSharedFees(
                "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
                selectedToken.name,
                selectedToken.symbol,
                selectedToken.description,
                selectedToken.twitterHandle,
                1000, // 10%
                9000  // 90%
            );
        } else {
            result = await launchTokenStandard(
                "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
                selectedToken.name,
                selectedToken.symbol,
                selectedToken.description
            );
        }

        console.log("\n🎉 Quick test completed!");
        console.log("🌐 View at: https://bags.fm/" + result.tokenMint);
        
    } catch (error) {
        console.error("❌ Quick test failed:", error.message);
    }
}

// Run tests
async function runTests() {
    console.log("\n🧪 Running Tests...\n");
    const { default: testModule } = await import('./test.js');
}

// Run examples
async function runExamples() {
    console.log("\n📚 Running Examples...\n");
    const { default: examplesModule } = await import('./examples.js');
}

// Start development mode
if (import.meta.url === `file://${process.argv[1]}`) {
    devMode().catch(console.error);
}

export { devMode };