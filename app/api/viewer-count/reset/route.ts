import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Reset viewer count for all offline streams
    await db.stream.updateMany({
      where: { isLive: false },
      data: { viewerCount: 0 }
    });

    // For live streams, keep current count (will be updated by real participants)
    const result = await db.stream.findMany({
      select: { id: true, isLive: true, viewerCount: true },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Viewer counts reset for offline streams",
      streams: result 
    });
  } catch (error) {
    console.error("Error resetting viewer counts:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}