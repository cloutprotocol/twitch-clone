import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get the first stream to test
    const stream = await db.stream.findFirst({
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
      }
    });

    if (!stream) {
      return NextResponse.json({ error: "No streams found" });
    }

    const thumbnailUrl = `/api/thumbnail/${stream.id}`;
    
    // Test the thumbnail endpoint
    try {
      const response = await fetch(`${req.nextUrl.origin}${thumbnailUrl}`);
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      
      // If it's an SVG, get the content to see what placeholder is being returned
      let content = null;
      if (contentType?.includes('svg')) {
        content = await response.text();
      }

      return NextResponse.json({
        stream: {
          id: stream.id,
          title: stream.title,
          username: stream.user.username,
          isLive: stream.isLive,
          storedThumbnail: stream.thumbnail
        },
        thumbnailTest: {
          url: thumbnailUrl,
          fullUrl: `${req.nextUrl.origin}${thumbnailUrl}`,
          status: response.status,
          contentType,
          contentLength,
          content: content ? content.substring(0, 200) + '...' : null
        }
      });

    } catch (fetchError) {
      return NextResponse.json({
        stream: {
          id: stream.id,
          title: stream.title,
          username: stream.user.username,
          isLive: stream.isLive,
          storedThumbnail: stream.thumbnail
        },
        thumbnailTest: {
          url: thumbnailUrl,
          error: fetchError instanceof Error ? fetchError.message : 'Unknown error'
        }
      });
    }

  } catch (error) {
    console.error("Single thumbnail test error:", error);
    return NextResponse.json({
      error: "Failed to test single thumbnail",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}