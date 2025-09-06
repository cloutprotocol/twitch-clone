import { NextRequest, NextResponse } from "next/server";
import { startAutoThumbnails } from "@/lib/thumbnail-service";
import { db } from "@/lib/db";

/**
 * POST /api/thumbnails/start
 * 
 * Start automatic thumbnail generation for a live stream
 * This endpoint can be called when a stream goes live to begin
 * generating thumbnails automatically.
 */
export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json();

    if (!streamId) {
      return new NextResponse("Stream ID is required", { status: 400 });
    }

    // Get stream and user info
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    if (!stream.isLive) {
      return new NextResponse("Stream is not live", { status: 400 });
    }

    console.log(`Starting thumbnails for ${stream.user.username}'s stream`);

    // Start automatic thumbnail generation
    const egressId = await startAutoThumbnails(streamId, stream.user.id);

    return NextResponse.json({ 
      success: true, 
      egressId,
      message: `Thumbnail generation started for ${stream.user.username}` 
    });

  } catch (error) {
    console.error("Failed to start thumbnails:", error);
    return NextResponse.json(
      { error: "Failed to start thumbnail generation", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}