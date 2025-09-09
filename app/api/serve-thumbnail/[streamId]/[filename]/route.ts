import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string; filename: string } }
) {
  try {
    const { streamId, filename } = params;
    
    // Security: validate filename to prevent path traversal
    if (!filename.match(/^[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png)$/)) {
      return new NextResponse("Invalid filename", { status: 400 });
    }
    
    const filepath = join('/tmp/thumbnails', filename);
    
    try {
      const fileBuffer = await readFile(filepath);
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (fileError) {
      // File not found, return placeholder SVG
      const placeholderSVG = `<svg width="1280" height="720" viewBox="0 0 1280 720" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="720" fill="#1a1a1a"/>
        <circle cx="640" cy="360" r="80" fill="#333"/>
        <path d="M620 330L680 360L620 390V330Z" fill="#666"/>
        <text x="640" y="450" text-anchor="middle" fill="#666" font-family="Arial, sans-serif" font-size="24">No Thumbnail</text>
      </svg>`;
      
      return new NextResponse(placeholderSVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
    
  } catch (error) {
    console.error("Serve thumbnail error:", error);
    return new NextResponse("Failed to serve thumbnail", { status: 500 });
  }
}