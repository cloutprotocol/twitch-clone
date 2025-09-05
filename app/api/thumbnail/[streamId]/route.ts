import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;

    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: {
        thumbnail: true,
        user: {
          select: {
            imageUrl: true,
          },
        },
      },
    });

    if (!stream) {
      return new NextResponse("Stream not found", { status: 404 });
    }

    // Return thumbnail or fallback to user avatar
    const thumbnailUrl = stream.thumbnail || stream.user.imageUrl;
    
    // Redirect to the actual image
    return NextResponse.redirect(thumbnailUrl);
  } catch (error) {
    console.error("Error fetching thumbnail:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}