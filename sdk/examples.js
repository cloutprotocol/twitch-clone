import { launchTokenWithSharedFees, launchTokenStandard } from './index.js';

/**
 * Example 1: Launch a token with fee sharing
 * 90% of fees go to the Twitter user, 10% to creator
 */
async function exampleFeeSharing() {
    console.log("🎯 Example 1: Token with Fee Sharing\n");
    
    try {
        const result = await launchTokenWithSharedFees(
            "https://img.freepik.com/premium-vector/white-abstract-vactor-background-design_665257-153.jpg",
            "Fee Share Token",
            "FST",
            "This token shares fees with a Twitter influencer!",
            "elonmusk", // Twitter username - replace with actual username
            1000,  // 10% for creator (1000 basis points)
            9000,  // 90% for fee claimer (9000 basis points)
            "https://t.me/feesharetoken",
            "https://twitter.com/feesharetoken",
            "https://feesharetoken.com"
        );
        
        console.log("\n✅ Fee sharing token launched successfully!");
        console.log("📊 Results:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("❌ Fee sharing example failed:", error.message);
    }
}

/**
 * Example 2: Launch a standard token without fee sharing
 */
async function exampleStandardLaunch() {
    console.log("🎯 Example 2: Standard Token Launch\n");
    
    try {
        const result = await launchTokenStandard(
            "https://img.freepik.com/premium-vector/colorful-gradient-background_23-2148995949.jpg",
            "Standard Token",
            "STD",
            "A regular token without fee sharing",
            "https://t.me/standardtoken",
            "https://twitter.com/standardtoken",
            "https://standardtoken.com",
            0.05 // 0.05 SOL initial buy
        );
        
        console.log("\n✅ Standard token launched successfully!");
        console.log("📊 Results:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("❌ Standard launch example failed:", error.message);
    }
}

/**
 * Example 3: Custom fee split (50/50)
 */
async function exampleCustomFeeSplit() {
    console.log("🎯 Example 3: Custom Fee Split (50/50)\n");
    
    try {
        const result = await launchTokenWithSharedFees(
            "https://img.freepik.com/premium-vector/abstract-blue-background_23-2148995950.jpg",
            "Equal Share Token",
            "EST",
            "This token splits fees equally between creator and claimer",
            "jack", // Twitter username - replace with actual username
            5000,  // 50% for creator
            5000,  // 50% for fee claimer
            undefined, // No telegram
            "https://twitter.com/equalsharetoken",
            undefined  // No website
        );
        
        console.log("\n✅ Equal share token launched successfully!");
        console.log("📊 Results:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("❌ Equal share example failed:", error.message);
    }
}

/**
 * Example 4: High creator fee (80/20)
 */
async function exampleHighCreatorFee() {
    console.log("🎯 Example 4: High Creator Fee (80/20)\n");
    
    try {
        const result = await launchTokenWithSharedFees(
            "https://img.freepik.com/premium-vector/purple-gradient-background_23-2148995951.jpg",
            "Creator Heavy Token",
            "CHT",
            "Creator keeps most of the fees in this token",
            "sundarpichai", // Twitter username - replace with actual username
            8000,  // 80% for creator
            2000,  // 20% for fee claimer
            "https://t.me/creatorheavytoken",
            "https://twitter.com/creatorheavytoken",
            "https://creatorheavytoken.com"
        );
        
        console.log("\n✅ Creator heavy token launched successfully!");
        console.log("📊 Results:", JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error("❌ Creator heavy example failed:", error.message);
    }
}

// Run examples (uncomment the ones you want to test)
async function runExamples() {
    console.log("🚀 Starting Bags SDK Fee Sharing Examples\n");
    console.log("=" .repeat(50));
    
    // Run one example at a time to avoid rate limits
    // await exampleStandardLaunch();
    // await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await exampleFeeSharing();
    // await new Promise(resolve => setTimeout(resolve, 2000));
    
    // await exampleCustomFeeSplit();
    // await new Promise(resolve => setTimeout(resolve, 2000));
    
    // await exampleHighCreatorFee();
    
    console.log("\n" + "=" .repeat(50));
    console.log("🎉 Examples completed!");
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples().catch(console.error);
}

export {
    exampleFeeSharing,
    exampleStandardLaunch,
    exampleCustomFeeSplit,
    exampleHighCreatorFee
};