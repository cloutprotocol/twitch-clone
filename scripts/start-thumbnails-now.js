#!/usr/bin/env node

/**
 * Start thumbnail generation for currently running stream
 */

const { PrismaClient } = require('@prisma/client');
const { EgressClient } = require('livekit-server-sdk');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const egressClient = new EgressClient(
  process.env.LIVEKIT_API_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

async function startThumbnailsForLiveStream() {
  try {
    console.log('🔍 Finding live stream...');
    
    // Get the current live stream
    const liveStream = await prisma.stream.findFirst({
      where: { isLive: true },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!liveStream) {
      console.log('❌ No live stream found');
      return;
    }

    console.log(`✅ Found live stream: ${liveStream.user.username}`);
    console.log(`   Stream ID: ${liveStream.id}`);
    console.log(`   Room Name: ${liveStream.user.id}`);
    console.log(`   Title: "${liveStream.title}"`);

    // Start thumbnail generation
    console.log('\n🎬 Starting thumbnail generation...');
    
    const imageOutput = {
      captureInterval: 10, // Every 10 seconds for testing
      width: 1280,
      height: 720,
      filenamePrefix: `thumbnails/${liveStream.id}/thumb_`,
      filenameSuffix: 1, // INDEX suffix
      disableManifest: false,
      
      // For now, we'll use file output to local storage for testing
      // You can switch to S3/GCP/Azure later
      output: {
        case: "file",
        value: {
          filepath: `/tmp/thumbnails/${liveStream.id}/thumb_{time}.jpg`
        }
      }
    };

    const egressInfo = await egressClient.startRoomCompositeEgress({
      roomName: liveStream.user.id,
      layout: "grid",
      audioOnly: false,
      videoOnly: false,
      
      // Image outputs for thumbnails
      imageOutputs: [imageOutput]
    });

    console.log('🎉 Thumbnail generation started!');
    console.log(`   Egress ID: ${egressInfo.egressId}`);
    console.log(`   Status: ${egressInfo.status}`);
    console.log(`   Capturing every 10 seconds at 1280x720`);
    console.log(`   Files will be saved to: /tmp/thumbnails/${liveStream.id}/`);
    
    // Update database with egress ID for tracking
    await prisma.stream.update({
      where: { id: liveStream.id },
      data: {
        // We could add an egressId field to track this
        thumbnail: `/tmp/thumbnails/${liveStream.id}/thumb_latest.jpg`
      }
    });

    console.log('\n📊 Monitor progress:');
    console.log('1. Check /tmp/thumbnails/ for generated images');
    console.log('2. Use LiveKit dashboard to monitor egress session');
    console.log(`3. Stop with: node scripts/stop-thumbnails.js ${egressInfo.egressId}`);
    
    return egressInfo.egressId;

  } catch (error) {
    console.error('❌ Failed to start thumbnails:', error.message);
    if (error.message.includes('room not found')) {
      console.log('💡 Make sure the stream is actually live in LiveKit');
    }
  }
}

startThumbnailsForLiveStream()
  .then((egressId) => {
    if (egressId) {
      console.log(`\n✅ Success! Egress ID: ${egressId}`);
    }
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());