const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function whitelistWallet(walletAddress) {
  try {
    console.log(`Whitelisting wallet: ${walletAddress}`);
    
    // Check if application already exists
    const existingApplication = await prisma.whitelistApplication.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    if (existingApplication) {
      // Update existing application to approved
      const updatedApplication = await prisma.whitelistApplication.update({
        where: {
          walletAddress: walletAddress
        },
        data: {
          status: "approved",
          updatedAt: new Date()
        }
      });

      console.log("✅ Existing application approved:", updatedApplication);
      return updatedApplication;
    } else {
      // Create new application and approve it
      const newApplication = await prisma.whitelistApplication.create({
        data: {
          walletAddress,
          streamIdea: "Admin approved wallet - direct whitelist",
          status: "approved"
        }
      });

      console.log("✅ New application created and approved:", newApplication);
      return newApplication;
    }

  } catch (error) {
    console.error("❌ Error whitelisting wallet:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// The wallet you want to whitelist
const WALLET_TO_WHITELIST = "JD2RrFp7cNjSZsfw4sm1mthKeQdV98euP3D2WC7k9Q2N";

// Run the script
whitelistWallet(WALLET_TO_WHITELIST)
  .then(() => {
    console.log("🎉 Wallet successfully whitelisted!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to whitelist wallet:", error);
    process.exit(1);
  });