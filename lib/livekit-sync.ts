import { RoomServiceClient } from "livekit-server-sdk";
import { db } from "@/lib/db";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export const syncViewerCounts = async () => {
  try {
    // Get all live streams from database
    const liveStreams = await db.stream.findMany({
      where: { isLive: true },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    console.log(`Syncing viewer counts for ${liveStreams.length} live streams`);

    for (const stream of liveStreams) {
      try {
        const roomName = `stream-${stream.id}`;
        
        // Get room info from LiveKit
        const rooms = await roomService.listRooms([roomName]);
        
        if (rooms.length > 0) {
          const room = rooms[0];
          const participantCount = Math.max(0, room.numParticipants - 1); // Exclude host
          
          // Update database with real participant count
          await db.stream.update({
            where: { id: stream.id },
            data: { viewerCount: participantCount },
          });
          
          console.log(`Updated ${stream.user.username}: ${participantCount} viewers`);
        } else {
          // Room doesn't exist, set to 0
          await db.stream.update({
            where: { id: stream.id },
            data: { viewerCount: 0 },
          });
          
          console.log(`Room not found for ${stream.user.username}, set to 0 viewers`);
        }
      } catch (error) {
        console.error(`Error syncing viewer count for stream ${stream.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error syncing viewer counts:", error);
  }
};

// Sync viewer counts every 30 seconds
export const startViewerCountSync = () => {
  console.log("Starting viewer count sync service...");
  
  // Initial sync
  syncViewerCounts();
  
  // Set up interval
  const interval = setInterval(syncViewerCounts, 30000); // 30 seconds
  
  return () => {
    clearInterval(interval);
    console.log("Viewer count sync service stopped");
  };
};