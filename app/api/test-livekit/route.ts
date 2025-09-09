import { NextResponse } from "next/server";
import { RoomServiceClient, AccessToken } from "livekit-server-sdk";

export async function GET() {
  try {
    console.log("Testing LiveKit connection...");
    console.log("API URL:", process.env.LIVEKIT_API_URL);
    console.log("API Key:", process.env.LIVEKIT_API_KEY?.substring(0, 10) + "...");
    
    const apiUrl = process.env.LIVEKIT_API_URL!;
    const apiKey = process.env.LIVEKIT_API_KEY!;
    const apiSecret = process.env.LIVEKIT_API_SECRET!;

    // Test JWT generation
    console.log("Testing JWT generation...");
    const token = new AccessToken(apiKey, apiSecret, {
      identity: 'test-connection',
      ttl: '10m',
    });

    token.addGrant({
      room: 'test-room',
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    console.log("JWT generated successfully, length:", jwt.length);

    // Test room service connection
    const roomService = new RoomServiceClient(apiUrl, apiKey, apiSecret);

    console.log("Testing room service...");
    const rooms = await roomService.listRooms();
    console.log("Room service working, found", rooms.length, "rooms");

    return NextResponse.json({
      success: true,
      message: "LiveKit connection successful",
      data: {
        apiUrl: process.env.LIVEKIT_API_URL,
        wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
        roomsCount: rooms.length,
        jwtGenerated: true,
        jwtLength: jwt.length,
        rooms: rooms.map(r => ({ 
          name: r.name, 
          numParticipants: r.numParticipants,
          creationTime: r.creationTime 
        }))
      }
    });

  } catch (error) {
    console.error("LiveKit connection test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        apiUrl: process.env.LIVEKIT_API_URL,
        wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL,
        hasApiKey: !!process.env.LIVEKIT_API_KEY,
        hasApiSecret: !!process.env.LIVEKIT_API_SECRET
      }
    }, { status: 500 });
  }
}