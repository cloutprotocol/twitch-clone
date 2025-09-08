import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCachedThumbnail, setCachedThumbnail } from "@/lib/thumbnail-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;
    
    // Get stream info
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: { 
        thumbnail: true, 
        isLive: true,
        user: {
          select: { id: true }
        }
      }
    });

    if (!stream) {
      // Return placeholder SVG content
      return new NextResponse(getPlaceholderSVG(), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // If we have a stored thumbnail URL, redirect to it
    if (stream.thumbnail && !stream.thumbnail.startsWith('/api/')) {
      return NextResponse.redirect(stream.thumbnail);
    }

    // For live streams without thumbnails, return placeholder for now
    // The client-side thumbnail generator will handle creating actual thumbnails
    return new NextResponse(getPlaceholderSVG(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60', // Short cache for live streams
      },
    });
    
  } catch (error) {
    console.error("Thumbnail API error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

function getPlaceholderSVG(): string {
  return `<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#1a1a1a"/>
    <circle cx="640" cy="360" r="80" fill="#333"/>
    <path d="M620 330L680 360L620 390V330Z" fill="#666"/>
    <text x="640" y="450" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="24">Stream Thumbnail</text>
  </svg>`;
}