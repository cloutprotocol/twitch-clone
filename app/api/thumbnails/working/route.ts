import { NextRequest, NextResponse } from "next/server";
import { EgressClient, EncodedFileType } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const egressClient = new EgressClient(
      process.env.LIVEKIT_API_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );

    // Using the correct SDK format for v1.2.7
    const egressInfo = await egressClient.startRoomCompositeEgress({
      roomName: "68bb53566eefdf6e7663b144",
      layout: "grid",
      audioOnly: false,
      videoOnly: false,
      
      // Correct format for SDK v1.2.7
      fileOutputs: [{
        fileType: EncodedFileType.MP4,
        filepath: `/tmp/stream-recording-{time}.mp4`
      }]
    });

    return NextResponse.json({ 
      success: true, 
      egressId: egressInfo.egressId,
      status: egressInfo.status,
      filepath: `/tmp/stream-recording-{time}.mp4`,
      message: "🎉 Recording started! Thumbnails can be extracted from video file" 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}