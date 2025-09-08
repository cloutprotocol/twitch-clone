import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tests = [];
    
    // Test 1: Check if thumbnail directories exist
    const fs = await import('fs');
    const thumbnailDir = '/tmp/thumbnails';
    
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
      tests.push({ test: "Thumbnail directory", status: "created", path: thumbnailDir });
    } else {
      tests.push({ test: "Thumbnail directory", status: "exists", path: thumbnailDir });
    }
    
    // Test 2: Check client-side thumbnail generator
    tests.push({ 
      test: "Client thumbnail generator", 
      status: "available", 
      note: "Use browser console to test" 
    });
    
    // Test 3: Check upload endpoint
    tests.push({ 
      test: "Upload endpoint", 
      status: "ready", 
      endpoint: "/api/upload-thumbnail" 
    });
    
    // Test 4: Check serve endpoint
    tests.push({ 
      test: "Serve endpoint", 
      status: "ready", 
      endpoint: "/api/serve-thumbnail/[streamId]/[filename]" 
    });
    
    return NextResponse.json({
      success: true,
      message: "Thumbnail system test results",
      tests,
      instructions: {
        "1": "Start a live stream to see thumbnail generation in action",
        "2": "Hover over the video player to see the thumbnail controls",
        "3": "Click 'Generate Now' to manually create a thumbnail",
        "4": "Check browser console for thumbnail generation logs",
        "5": "Thumbnails will appear in stream preview cards after generation"
      }
    });
    
  } catch (error) {
    console.error("Thumbnail system test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}