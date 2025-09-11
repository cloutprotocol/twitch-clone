const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWhitelistStatus(walletAddress) {
  try {
    console.log(`Checking whitelist status for: ${walletAddress}`);
    
    const application = await prisma.whitelistApplication.findUnique({
      where: {
        walletAddress: walletAddress
      },
      select: {
        id: true,
        walletAddress: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        streamIdea: true
      }
    });

    if (application) {
      console.log("📋 Application found:");
      console.log(`   Status: ${application.status}`);
      console.log(`   Created: ${application.createdAt}`);
      console.log(`   Updated: ${application.updatedAt || 'Never'}`);
      console.log(`   Stream Idea: ${application.streamIdea}`);
      
      if (application.status === 'approved') {
        console.log("✅ Wallet is APPROVED");
      } else if (application.status === 'pending') {
        console.log("⏳ Wallet is PENDING approval");
      } else if (application.status === 'rejected') {
        console.log("❌ Wallet is REJECTED");
      }
    } else {
      console.log("❌ No whitelist application found for this wallet");
    }

    return application;

  } catch (error) {
    console.error("❌ Error checking whitelist status:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// The wallet you want to check
const WALLET_TO_CHECK = "JD2RrFp7cNjSZsfw4sm1mthKeQdV98euP3D2WC7k9Q2N";

// Run the script
checkWhitelistStatus(WALLET_TO_CHECK)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to check wallet status:", error);
    process.exit(1);
  });