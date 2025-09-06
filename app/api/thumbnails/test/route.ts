import { NextRequest, NextResponse } from "next/server";
import { EgressClient } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const egressClient = new EgressClient(
      process.env.LIVEKIT_API_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );

    // Test with minimal configuration using new API signature
    const egressInfo = await egressClient.startRoomCompositeEgress({
      roomName: "68bb53566eefdf6e7663b144",
      layout: "grid",
      output: {
        file: {
          filepath: `/tmp/test-recording-{time}.mp4`
        }
      },
      audioOnly: false,
      videoOnly: false
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
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3) : undefined
    }, { status: 500 });
  }
}