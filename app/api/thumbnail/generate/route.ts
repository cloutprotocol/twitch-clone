import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedThumbnail, setCachedThumbnail } from "@/lib/thumbnail-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return new NextResponse("Stream ID required", { status: 400 });
  }

  try {
    // Check cache first
    const cachedThumbnail = getCachedThumbnail(streamId);
    if (cachedThumbnail) {
      return NextResponse.json({ thumbnailUrl: cachedThumbnail, cached: true });
    }

    // Get from database
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: { 
        thumbnail: true,
        isLive: true,
        user: {
          select: {
            imageUrl: true,
            username: true,
          },
        },
      },
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    // Use existing thumbnail or fallback to user avatar
    const thumbnailUrl = stream.thumbnail || stream.user.imageUrl;
    
    // Cache the result
    setCachedThumbnail(streamId, thumbnailUrl);

    return NextResponse.json({ 
      thumbnailUrl,
      isLive: stream.isLive,
      cached: false 
    });
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}