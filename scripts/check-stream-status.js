const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStreamStatus(walletAddress) {
  try {
    console.log(`Checking stream status for wallet: ${walletAddress}`);
    
    // First, find the user by wallet address
    const user = await prisma.user.findFirst({
      where: {
        wallets: {
          some: {
            address: walletAddress
          }
        }
      },
      include: {
        wallets: true,
        stream: {
          select: {
            id: true,
            title: true,
            isLive: true,
            viewerCount: true,
            thumbnail: true,
            updatedAt: true,
            createdAt: true,
            serverUrl: true,
            streamKey: true,
            ingressId: true
          }
        }
      }
    });

    if (!user) {
      console.log("❌ No user found with that wallet address");
      return;
    }

    console.log("👤 User found:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Wallets: ${user.wallets.map(w => w.address).join(', ')}`);

    if (!user.stream) {
      console.log("❌ No stream found for this user");
      return;
    }

    console.log("📺 Stream found:");
    console.log(`   Stream ID: ${user.stream.id}`);
    console.log(`   Title: ${user.stream.title}`);
    console.log(`   Is Live: ${user.stream.isLive}`);
    console.log(`   Viewer Count: ${user.stream.viewerCount}`);
    console.log(`   Thumbnail: ${user.stream.thumbnail || 'None'}`);
    console.log(`   Created: ${user.stream.createdAt}`);
    console.log(`   Updated: ${user.stream.updatedAt}`);
    console.log(`   Server URL: ${user.stream.serverUrl || 'None'}`);
    console.log(`   Stream Key: ${user.stream.streamKey ? 'Set' : 'None'}`);
    console.log(`   Ingress ID: ${user.stream.ingressId || 'None'}`);

    // Check all live streams in the database
    console.log("\n🔍 All live streams in database:");
    const allLiveStreams = await prisma.stream.findMany({
      where: {
        isLive: true
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (allLiveStreams.length === 0) {
      console.log("   No live streams found in database");
    } else {
      allLiveStreams.forEach((stream, index) => {
        console.log(`   ${index + 1}. ${stream.user.username} (${stream.user.id}) - "${stream.title}"`);
        console.log(`      Stream ID: ${stream.id}`);
        console.log(`      Viewers: ${stream.viewerCount}`);
        console.log(`      Updated: ${stream.updatedAt}`);
      });
    }

    return { user, stream: user.stream, allLiveStreams };

  } catch (error) {
    console.error("❌ Error checking stream status:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// The wallet to check
const WALLET_TO_CHECK = "JD2RrFp7cNjSZsfw4sm1mthKeQdV98euP3D2WC7k9Q2N";

// Run the script
checkStreamStatus(WALLET_TO_CHECK)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to check stream status:", error);
    process.exit(1);
  });