import { NextResponse } from "next/server";
import { getThumbnailUrl } from "@/lib/thumbnail-service";

export async function GET() {
  try {
    // Test the thumbnail URL generation (client-safe)
    const testStreamId = "test-stream-123";
    const thumbnailUrl = getThumbnailUrl(testStreamId);
    
    return NextResponse.json({
      success: true,
      thumbnailUrl,
      message: "Thumbnail service is working correctly"
    });
  } catch (error) {
    console.error("Thumbnail test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}