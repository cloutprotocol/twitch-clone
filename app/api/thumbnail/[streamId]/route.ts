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

    // If we have a stored thumbnail URL that's external, redirect to it
    if (stream.thumbnail && stream.thumbnail.startsWith('http')) {
      return NextResponse.redirect(stream.thumbnail);
    }

    // If we have a stored thumbnail that's an API endpoint, try to serve it
    if (stream.thumbnail && stream.thumbnail.startsWith('/api/serve-thumbnail/')) {
      try {
        // Extract the filename from the stored thumbnail path
        const pathParts = stream.thumbnail.split('/');
        const filename = pathParts[pathParts.length - 1];
        
        // Try to serve the file directly
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${stream.thumbnail}`);
        
        if (response.ok) {
          // File exists, return it
          const buffer = await response.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      } catch (error) {
        console.log(`Stored thumbnail file not accessible: ${stream.thumbnail}`);
      }
    }

    // For live streams or when stored thumbnails don't work, return placeholder
    return new NextResponse(getPlaceholderSVG(), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': stream.isLive ? 'public, max-age=60' : 'public, max-age=300',
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