import { NextRequest, NextResponse } from "next/server";
import { getStreamViewerCount } from "@/lib/viewer-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;

    if (!streamId) {
      return new NextResponse("Stream ID is required", { status: 400 });
    }

    const count = await getStreamViewerCount(streamId);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching viewer count:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}