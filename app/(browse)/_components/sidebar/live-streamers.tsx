import { db } from "@/lib/db";
import { RoomServiceClient } from "livekit-server-sdk";
import { UserItem } from "./user-item";

export const LiveStreamers = async () => {
  let liveStreamers: any[] = [];
  
  try {
    // Fetch potentially live streamers from database
    const potentiallyLiveStreamers = await db.stream.findMany({
      where: {
        isLive: true,
      },
      select: {
        id: true,
        viewerCount: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { viewerCount: "desc" },
        { updatedAt: "desc" },
      ],
      take: 20, // Get more to filter down to actual live streams
    });

    // Verify which streams are actually live by checking LiveKit rooms
    if (potentiallyLiveStreamers.length > 0) {
      try {
        const roomService = new RoomServiceClient(
          process.env.LIVEKIT_API_URL!,
          process.env.LIVEKIT_API_KEY!,
          process.env.LIVEKIT_API_SECRET!
        );

        const rooms = await roomService.listRooms();

        // Filter streams to only include those with active LiveKit rooms with participants
        for (const stream of potentiallyLiveStreamers) {
          // Check multiple possible room name formats
          const possibleRoomNames = [
            stream.user.id,         // User ID (most common)
            `stream-${stream.id}`,  // Stream ID format
            stream.id,              // Just the stream ID
            stream.user.username,   // Username
          ];
          
          let isActuallyLive = false;
          for (const roomName of possibleRoomNames) {
            const room = rooms.find(r => r.name === roomName);
            if (room && room.numParticipants > 0) {
              // Check if the actual streamer is connected to their room
              try {
                const participants = await roomService.listParticipants(room.name);
                const streamerConnected = participants.some(p => p.identity === stream.user.id);
                if (streamerConnected) {
                  console.log(`[Sidebar] Found live room for ${stream.user.username}: ${room.name} (streamer connected)`);
                  isActuallyLive = true;
                  break;
                } else {
                  console.log(`[Sidebar] Room ${room.name} has participants but ${stream.user.username} is not connected`);
                }
              } catch (error) {
                console.log(`[Sidebar] Error checking participants for ${room.name}:`, error);
              }
            }
          }
          
          if (isActuallyLive) {
            liveStreamers.push(stream);
          } else {
            console.log(`[Sidebar] No live room found for ${stream.user.username} - excluding from live list`);
          }
        }

        // Limit to 10 for sidebar display
        liveStreamers = liveStreamers.slice(0, 10);
      } catch (error) {
        console.error("Error verifying live streams with LiveKit:", error);
        // Fallback to database results if LiveKit check fails
        liveStreamers = potentiallyLiveStreamers.slice(0, 10);
      }
    }
  } catch (error) {
    console.error("Error fetching live streamers for sidebar:", error);
    // Return null on error to hide the component
    return null;
  }

  if (liveStreamers.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="space-y-1 px-2">
        {liveStreamers.map((stream) => (
          <UserItem
            key={stream.user.id}
            username={stream.user.username}
            imageUrl={stream.user.imageUrl}
            isLive={true}
            viewerCount={stream.viewerCount}
          />
        ))}
      </ul>
    </div>
  );
};

export const LiveStreamersSkeleton = () => {
  return (
    <div>
      <ul className="space-y-1 px-2">
        {[...Array(3)].map((_, i) => (
          <li key={i} className="flex items-center gap-x-4 px-3 py-2">
            <div className="relative">
              <div className="bg-muted min-h-[32px] min-w-[32px] rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-12"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};