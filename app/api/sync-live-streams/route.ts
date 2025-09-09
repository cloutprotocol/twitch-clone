import { NextResponse } from "next/server";
import { RoomServiceClient } from "livekit-server-sdk";
import { db } from "@/lib/db";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST() {
  try {
    console.log("🔄 Starting live stream sync...");
    
    // Get all streams from database
    const allStreams = await db.stream.findMany({
      select: {
        id: true,
        isLive: true,
        ingressId: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    console.log(`📊 Found ${allStreams.length} total streams in database`);

    // Get all active rooms from LiveKit
    const rooms = await roomService.listRooms();
    console.log(`🏠 Found ${rooms.length} active LiveKit rooms`);

    const activeRoomNames = new Set(rooms.map(room => room.name));
    let updatedStreams = 0;
    let liveStreamsFound = 0;

    for (const stream of allStreams) {
      // Check multiple possible room name formats
      const possibleRoomNames = [
        `stream-${stream.id}`,  // Standard format
        stream.id,              // Just the ID
        stream.user.id,         // User ID
        `${stream.user.username}`, // Username
      ];
      
      // Find matching room
      let matchingRoom = null;
      for (const roomName of possibleRoomNames) {
        matchingRoom = rooms.find(r => r.name === roomName);
        if (matchingRoom) {
          console.log(`🔍 Found room for ${stream.user.username}: ${matchingRoom.name} (${matchingRoom.numParticipants} participants)`);
          break;
        }
      }
      
      // A stream is only live if it has a room AND the actual streamer is connected
      let shouldBeLive = false;
      if (matchingRoom && matchingRoom.numParticipants > 0) {
        // Check if the actual streamer (user) is connected to their room
        try {
          const participants = await roomService.listParticipants(matchingRoom.name);
          const streamerConnected = participants.some(p => p.identity === stream.user.id);
          shouldBeLive = streamerConnected;
          
          if (!streamerConnected) {
            console.log(`⚠️ Room ${matchingRoom.name} has participants but streamer ${stream.user.username} (${stream.user.id}) is not connected`);
          }
        } catch (error) {
          console.log(`❌ Error checking participants for room ${matchingRoom.name}:`, error);
          shouldBeLive = false;
        }
      }
      
      if (!matchingRoom) {
        console.log(`❌ No room found for ${stream.user.username} (${stream.id}) - marking as offline`);
      } else if (matchingRoom.numParticipants === 0) {
        console.log(`⚠️ Room ${matchingRoom.name} for ${stream.user.username} has 0 participants - marking as offline`);
      }
      
      if (shouldBeLive) {
        liveStreamsFound++;
      }
      
      // Update database if status doesn't match
      if (stream.isLive !== shouldBeLive) {
        await db.stream.update({
          where: { id: stream.id },
          data: { 
            isLive: shouldBeLive,
            viewerCount: shouldBeLive 
              ? Math.max(0, (matchingRoom?.numParticipants ?? 1) - 1)
              : 0
          },
        });
        
        console.log(
          `✅ Updated ${stream.user.username}: ${stream.isLive ? 'live' : 'offline'} → ${shouldBeLive ? 'live' : 'offline'}${matchingRoom ? ` (room: ${matchingRoom.name}, participants: ${matchingRoom.numParticipants})` : ''}`
        );
        updatedStreams++;
      } else if (matchingRoom) {
        console.log(`✓ ${stream.user.username} already has correct status: ${stream.isLive ? 'live' : 'offline'}`);
      }
    }

    console.log(`🎯 Sync complete: ${updatedStreams} streams updated, ${liveStreamsFound} live streams found`);

    return NextResponse.json({ 
      success: true, 
      message: `Live stream sync complete`,
      stats: {
        totalStreams: allStreams.length,
        liveStreamsFound,
        updatedStreams,
        activeRooms: rooms.length
      }
    });
  } catch (error) {
    console.error("❌ Error syncing live streams:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  return POST(); // Allow GET requests as well
}