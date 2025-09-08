import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();
    const { streamId, thumbnailUrl } = await req.json();
    
    if (!streamId || !thumbnailUrl) {
      return new NextResponse("Missing streamId or thumbnailUrl", { status: 400 });
    }

    // Verify user owns the stream
    const stream = await db.stream.update({
      where: { 
        id: streamId,
        userId: self.id 
      },
      data: {
        thumbnail: thumbnailUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      stream: {
        id: stream.id,
        thumbnail: stream.thumbnail
      }
    });
    
  } catch (error) {
    console.error("Update thumbnail error:", error);
    return new NextResponse("Update failed", { status: 500 });
  }
}