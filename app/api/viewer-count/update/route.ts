import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateViewerCount } from "@/lib/viewer-service";

export async function POST(req: NextRequest) {
  try {
    const { streamId, count } = await req.json();

    if (!streamId || typeof count !== 'number') {
      return new NextResponse("Invalid parameters", { status: 400 });
    }

    await updateViewerCount(streamId, count);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating viewer count:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Batch update multiple streams
export async function PUT(req: NextRequest) {
  try {
    const { updates } = await req.json();

    if (!Array.isArray(updates)) {
      return new NextResponse("Invalid parameters", { status: 400 });
    }

    const promises = updates.map(({ streamId, count }) => 
      updateViewerCount(streamId, count)
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error("Error batch updating viewer counts:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}