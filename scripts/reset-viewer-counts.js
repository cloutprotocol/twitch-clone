const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetViewerCounts() {
  try {
    // Reset all viewer counts to 0
    const result = await prisma.stream.updateMany({
      data: { viewerCount: 0 }
    });

    console.log(`Reset viewer counts for ${result.count} streams`);
    
    // Show current streams
    const streams = await prisma.stream.findMany({
      select: {
        id: true,
        title: true,
        isLive: true,
        viewerCount: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    console.log('\nCurrent streams:');
    streams.forEach(stream => {
      console.log(`- ${stream.user.username}: ${stream.title} (Live: ${stream.isLive}, Viewers: ${stream.viewerCount})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetViewerCounts();