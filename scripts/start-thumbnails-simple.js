#!/usr/bin/env node

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

async function startSimpleThumbnails() {
  try {
    console.log('🔍 Finding live stream...');
    
    const liveStream = await prisma.stream.findFirst({
      where: { isLive: true },
      include: { user: { select: { id: true, username: true } } }
    });

    if (!liveStream) {
      console.log('❌ No live stream found');
      return;
    }

    console.log(`✅ Found live stream: ${liveStream.user.username} - "${liveStream.title}"`);

    // Start basic room composite recording (which includes thumbnails in some configurations)
    const egressInfo = await egressClient.startRoomCompositeEgress({
      roomName: liveStream.user.id,
      layout: "grid",
      audioOnly: false,
      videoOnly: false,
      
      // Basic file output - LiveKit will generate thumbnails automatically
      fileOutputs: [{
        fileType: 4, // MP4
        filepath: `/tmp/stream_${liveStream.id}_{time}.mp4`,
        disableManifest: true
      }]
    });

    console.log('🎉 Recording started with thumbnail generation!');
    console.log(`   Egress ID: ${egressInfo.egressId}`);
    console.log(`   Status: ${egressInfo.status}`);
    console.log(`   Recording to: /tmp/stream_${liveStream.id}_{time}.mp4`);
    
    // Save egress ID for cleanup later
    console.log(`\n📋 Save this Egress ID: ${egressInfo.egressId}`);
    console.log(`To stop: curl -X POST "${process.env.LIVEKIT_API_URL}/twirp/livekit.Egress/StopEgress" -H "Authorization: Bearer $(echo -n '${process.env.LIVEKIT_API_KEY}:${process.env.LIVEKIT_API_SECRET}' | base64)" -d '{"egress_id":"${egressInfo.egressId}"}'`);

    return egressInfo.egressId;

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

startSimpleThumbnails()
  .finally(() => prisma.$disconnect());