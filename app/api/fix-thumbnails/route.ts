import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Find all streams with broken thumbnail references
    const streams = await db.stream.findMany({
      where: {
        thumbnail: {
          startsWith: '/api/serve-thumbnail/'
        }
      },
      select: {
        id: true,
        thumbnail: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    console.log(`Found ${streams.length} streams with potentially broken thumbnails`);

    // Clear the broken thumbnail references
    const updateResult = await db.stream.updateMany({
      where: {
        thumbnail: {
          startsWith: '/api/serve-thumbnail/'
        }
      },
      data: {
        thumbnail: null
      }
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${updateResult.count} broken thumbnail references`,
      clearedStreams: streams.map(s => ({
        id: s.id,
        username: s.user.username,
        oldThumbnail: s.thumbnail
      }))
    });

  } catch (error) {
    console.error("Fix thumbnails error:", error);
    return NextResponse.json({
      error: "Failed to fix thumbnails",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}