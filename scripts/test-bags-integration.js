#!/usr/bin/env node

/**
 * Simple test script to verify Bags SDK integration
 */

async function testIntegration() {
  console.log("🧪 Testing Bags SDK integration...");

  try {
    // Test environment variables
    console.log("\n📋 Checking environment variables:");
    const requiredEnvVars = ['BAGS_API_KEY', 'SOLANA_RPC_URL'];
    
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${envVar}: Not set`);
      }
    }

    // Test SDK import
    console.log("\n📦 Testing SDK import:");
    try {
      const { BagsSDK } = await import("@bagsfm/bags-sdk");
      console.log("✅ Bags SDK imported successfully");
      
      // Test SDK initialization
      const sdk = new BagsSDK({
        apiKey: process.env.BAGS_API_KEY || "test",
        rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      });
      console.log("✅ SDK initialized successfully");
    } catch (error) {
      console.log("❌ SDK import failed:", error.message);
    }

    // Test Solana Web3 import
    console.log("\n🔗 Testing Solana Web3 import:");
    try {
      const { Connection, Keypair } = await import("@solana/web3.js");
      console.log("✅ Solana Web3.js imported successfully");
    } catch (error) {
      console.log("❌ Solana Web3.js import failed:", error.message);
    }

    // Test bs58 import
    console.log("\n🔐 Testing bs58 import:");
    try {
      const bs58 = await import("bs58");
      console.log("✅ bs58 imported successfully");
    } catch (error) {
      console.log("❌ bs58 import failed:", error.message);
    }

    console.log("\n🎉 Integration test completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Make sure your .env file has the required variables");
    console.log("2. Start your development server: npm run dev");
    console.log("3. Navigate to /u/[username]/launch to test the UI");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Load environment variables and run test
(async () => {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch (error) {
    console.log("Note: dotenv not available, using system environment");
  }
  
  await testIntegration();
})();