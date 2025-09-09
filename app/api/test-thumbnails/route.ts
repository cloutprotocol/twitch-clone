import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get all streams with their thumbnail info
    const streams = await db.stream.findMany({
      select: {
        id: true,
        title: true,
        thumbnail: true,
        isLive: true,
        user: {
          select: {
            username: true
          }
        }
      },
      take: 10
    });

    // Test thumbnail URLs for each stream
    const thumbnailTests = await Promise.all(
      streams.map(async (stream) => {
        const thumbnailUrl = `/api/thumbnail/${stream.id}`;
        
        try {
          // Test if thumbnail endpoint responds
          const response = await fetch(`${req.nextUrl.origin}${thumbnailUrl}`);
          
          return {
            streamId: stream.id,
            title: stream.title,
            username: stream.user.username,
            isLive: stream.isLive,
            storedThumbnail: stream.thumbnail,
            thumbnailUrl,
            thumbnailStatus: response.status,
            thumbnailContentType: response.headers.get('content-type'),
            thumbnailSize: response.headers.get('content-length')
          };
        } catch (error) {
          return {
            streamId: stream.id,
            title: stream.title,
            username: stream.user.username,
            isLive: stream.isLive,
            storedThumbnail: stream.thumbnail,
            thumbnailUrl,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return NextResponse.json({
      totalStreams: streams.length,
      thumbnailTests
    });

  } catch (error) {
    console.error("Thumbnail test error:", error);
    return NextResponse.json({
      error: "Failed to test thumbnails",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}