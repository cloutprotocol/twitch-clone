import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get all streams to see what we have
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
      take: 5 // Just get first 5
    });

    if (streams.length === 0) {
      return NextResponse.json({ 
        error: "No streams found",
        totalStreams: 0
      });
    }

    // Return basic info without making internal HTTP calls
    const streamInfo = streams.map(stream => ({
      id: stream.id,
      title: stream.title,
      username: stream.user.username,
      isLive: stream.isLive,
      storedThumbnail: stream.thumbnail,
      thumbnailUrl: `/api/thumbnail/${stream.id}`,
      hasThumbnail: !!stream.thumbnail,
      thumbnailType: stream.thumbnail?.startsWith('http') ? 'external' : 
                    stream.thumbnail?.startsWith('/api/') ? 'api' : 
                    stream.thumbnail ? 'relative' : 'none'
    }));

    return NextResponse.json({
      totalStreams: streams.length,
      streams: streamInfo,
      diagnosis: {
        streamsWithThumbnails: streams.filter(s => s.thumbnail).length,
        liveStreams: streams.filter(s => s.isLive).length,
        externalThumbnails: streams.filter(s => s.thumbnail?.startsWith('http')).length,
        apiThumbnails: streams.filter(s => s.thumbnail?.startsWith('/api/')).length
      }
    });

  } catch (error) {
    console.error("Stream diagnosis error:", error);
    return NextResponse.json({
      error: "Failed to diagnose streams",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}