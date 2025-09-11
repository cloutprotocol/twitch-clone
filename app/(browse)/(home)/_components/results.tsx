import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { RoomServiceClient } from "livekit-server-sdk";

import { ResultCard, ResultCardSkeleton } from "./result-card";
import { LiveMarquee } from "./live-marquee";
import { StreamSearch } from "./stream-search";
import { StartStreamWrapper } from "./start-stream-wrapper";

export const Results = async () => {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;
  const username = session?.user?.username;

  let liveStreams: any[] = [];
  
  try {
    // Get all streams that claim to be live from database
    const potentiallyLiveStreams = await db.stream.findMany({
    where: {
      isLive: true, // Only get streams marked as live in DB
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
        },
      },
      isLive: true,
      title: true,
      thumbnail: true,
      viewerCount: true,
      updatedAt: true,
      _count: {
        select: {
          chatMessages: true,
        },
      },
    },
    orderBy: [
      { viewerCount: "desc" },
      { updatedAt: "desc" },
    ],
    take: 50,
  });

    // Verify which streams are actually live by checking LiveKit rooms
    if (potentiallyLiveStreams.length > 0) {
      try {
        const roomService = new RoomServiceClient(
          process.env.LIVEKIT_API_URL!,
          process.env.LIVEKIT_API_KEY!,
          process.env.LIVEKIT_API_SECRET!
        );

        const rooms = await roomService.listRooms();

        // Filter streams to only include those with active LiveKit rooms with participants
        liveStreams = [];
        for (const stream of potentiallyLiveStreams) {
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
                  isActuallyLive = true;
                  break;
                }
              } catch (error) {
                console.error(`Error checking participants for room ${room.name}:`, error);
              }
            }
          }
          
          if (isActuallyLive) {
            liveStreams.push(stream);
          }
        }
      } catch (error) {
        console.error("Error verifying live streams with LiveKit:", error);
        // Fallback to database results if LiveKit check fails
        liveStreams = potentiallyLiveStreams;
      }
    }
  } catch (error) {
    console.error("Error fetching live streams:", error);
    // Fallback to empty array on database error
    liveStreams = [];
  }

  return (
    <div className="w-full min-h-screen">
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-12">
        {/* Search Section */}
        <StreamSearch />
        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <section>
            {/* Minimal header with just live indicator */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <div className="w-6 h-6 bg-streaming-live rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="absolute -inset-1 bg-streaming-live rounded-full opacity-20 animate-ping"></div>
              </div>
              <span className="text-sm text-text-secondary">
                {liveStreams.length} live
              </span>
            </div>
            
            {/* Responsive grid - single column on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Start Stream Card */}
              <StartStreamWrapper isLoggedIn={isLoggedIn} username={username} />
              
              {/* Live Stream Cards */}
              {liveStreams.map((stream) => (
                <ResultCard key={stream.id} data={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State - Show Start Stream Card */}
        {liveStreams.length === 0 && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Start Stream Card */}
              <StartStreamWrapper isLoggedIn={isLoggedIn} username={username} />
              
              {/* Empty state message card */}
              <div className="md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border-primary/30 rounded-lg bg-background-secondary/20">
                <div className="space-y-4 max-w-lg">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-2 border-dashed border-text-tertiary/40 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-text-tertiary/60 rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-text-tertiary/60 rotate-45 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-text-primary">
                    No live streams
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    No one is streaming right now. Check back soon for live content, or be the first to go live!
                  </p>
                  
                  <div className="flex items-center gap-2 justify-center pt-2">
                    <div className="w-2 h-2 bg-text-tertiary rounded-full animate-pulse"></div>
                    <span className="text-sm text-text-secondary">Waiting for streamers...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Live Streams Marquee - Footer Position */}
      <LiveMarquee streams={liveStreams} />
    </div>
  );
};

export const ResultsSkeleton = () => {
  return (
    <div className="w-full">
      {/* Marquee Skeleton */}
      <div className="w-full bg-muted h-10" />
      
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Search Skeleton */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        {/* Live Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Recommended Section Skeleton */}
        <section>
          <Skeleton className="h-9 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(14)].map((_, i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
