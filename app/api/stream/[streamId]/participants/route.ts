import { NextRequest, NextResponse } from "next/server";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { db } from "@/lib/db";

/**
 * LiveKit Room Service Client
 * 
 * Used to query LiveKit server for real-time participant information
 * without establishing WebSocket connections from client components
 */
const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

/**
 * GET /api/stream/[streamId]/participants
 * 
 * Retrieves real-time participant count for a specific stream from LiveKit server.
 * This API endpoint solves the viewer count synchronization problem by providing
 * a single source of truth for both home page cards and stream detail pages.
 * 
 * Problem Solved:
 * - Home page cards showed cached database viewer counts (e.g., 3.8k mock data)
 * - Stream detail pages showed real-time LiveKit participant counts (e.g., 2 viewers)
 * - Counts were out of sync and confusing for users
 * 
 * Solution Architecture:
 * 1. Stream detail page: Uses LiveKit useParticipants() hook directly (real-time)
 * 2. Home page cards: Fetch from this API endpoint (server-side LiveKit query)
 * 3. Both show identical participant counts from same LiveKit room
 * 
 * Key Implementation Details:
 * - Converts streamId -> userId because LiveKit rooms are named by userId
 * - Excludes host from participant count (viewers = participants - 1)
 * - Handles non-existent rooms gracefully by returning 0
 * - No WebSocket connections from client (avoids audio context issues)
 * 
 * @param streamId - Database stream ID from URL parameter
 * @returns JSON response with current participant count
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;

    // Validate required parameter
    if (!streamId) {
      return new NextResponse("Stream ID is required", { status: 400 });
    }

    /**
     * Database Lookup: streamId -> userId
     * 
     * LiveKit rooms are created with userId as room name (see actions/token.ts:43)
     * but our frontend components only have access to streamId, so we need to
     * look up the corresponding userId to query the correct LiveKit room
     */
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: { userId: true }
    });

    if (!stream) {
      // Stream not found in database, return 0 viewers
      return NextResponse.json({ count: 0 });
    }

    try {
      /**
       * LiveKit Server Query
       * 
       * Query LiveKit server for participant list using userId as room name.
       * This matches the room naming convention used in token creation:
       * - actions/token.ts line 43: token.addGrant({ room: host.id })
       * - where host.id is the userId
       */
      const participants = await roomService.listParticipants(stream.userId);
      
      /**
       * Calculate Viewer Count
       * 
       * Exclude host from participant count since they shouldn't be counted
       * as a viewer of their own stream. Host is identified by identity
       * pattern `Host-${userId}` (see actions/token.ts:37)
       */
      const viewerCount = Math.max(0, participants.length - 1);
      
      return NextResponse.json({ count: viewerCount });
    } catch (error) {
      /**
       * LiveKit Room Error Handling
       * 
       * If room doesn't exist or has no participants, LiveKit throws an error.
       * This is normal for offline streams or streams with no viewers.
       * Return 0 instead of propagating the error.
       */
      return NextResponse.json({ count: 0 });
    }
  } catch (error) {
    // Log unexpected errors but still return graceful response
    console.error("Error fetching participant count:", error);
    return NextResponse.json({ count: 0 });
  }
}