import { NextRequest, NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { db } from "@/lib/db";
import { setCachedThumbnail } from "@/lib/thumbnail-service";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return new NextResponse("Missing authorization header", { status: 401 });
    }

    // Verify webhook signature
    const event = receiver.receive(body, authHeader);
    
    // Handle egress events (thumbnail generation)
    if (event.event === "egress_ended" && event.egressInfo) {
      const { egressInfo } = event;
      
      // Extract stream ID from filename or room name
      const streamId = extractStreamId(egressInfo);
      if (!streamId) {
        console.log("Could not extract stream ID from egress info");
        return new NextResponse("OK", { status: 200 });
      }

      // Update database with new thumbnail URL
      if (egressInfo.fileResults && egressInfo.fileResults.length > 0) {
        const thumbnailUrl = egressInfo.fileResults[0].location;
        
        if (thumbnailUrl) {
          await db.stream.update({
            where: { id: streamId },
            data: { 
              thumbnail: thumbnailUrl,
              updatedAt: new Date()
            }
          });

          // Update cache
          setCachedThumbnail(streamId, thumbnailUrl, undefined, true);
          
          console.log(`Updated thumbnail for stream ${streamId}: ${thumbnailUrl}`);
        }
      }
    }

    // Handle room events for automatic thumbnail management
    if (event.event === "room_started") {
      // Room started - could trigger thumbnail generation
      console.log(`Room started: ${event.room?.name}`);
    }
    
    if (event.event === "room_finished") {
      // Room ended - cleanup thumbnails
      console.log(`Room finished: ${event.room?.name}`);
    }

    return new NextResponse("OK", { status: 200 });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}

function extractStreamId(egressInfo: any): string | null {
  try {
    // Try to extract from filename
    if (egressInfo.fileResults?.[0]?.filename) {
      const filename = egressInfo.fileResults[0].filename;
      const match = filename.match(/thumbnail-([^-]+)/);
      if (match) return match[1];
    }
    
    // Try to extract from room name or other metadata
    if (egressInfo.roomName) {
      // If room name contains stream ID
      return egressInfo.roomName;
    }
    
    return null;
  } catch (error) {
    console.error("Failed to extract stream ID:", error);
    return null;
  }
}