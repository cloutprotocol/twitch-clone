import { NextRequest, NextResponse } from "next/server";
import { EgressClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const egressClient = new EgressClient(
      process.env.LIVEKIT_API_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );

    // Test with minimal configuration
    const egressInfo = await egressClient.startRoomCompositeEgress({
      roomName: "68bb53566eefdf6e7663b144", // Your live room ID from test
      layout: "grid",
      audioOnly: false,
      videoOnly: false,
      outputs: {
        file: {
          filepath: `/tmp/test-recording-{time}.mp4`
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      egressId: egressInfo.egressId,
      status: egressInfo.status,
      message: "Recording started - thumbnails can be extracted from video file" 
    });

  } catch (error) {
    console.error("Egress test failed:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3) 
    }, { status: 500 });
  }
}