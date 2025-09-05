import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [totalStreams, liveStreams, totalViewers, totalMessages] = await Promise.all([
      db.stream.count(),
      db.stream.count({ where: { isLive: true } }),
      db.stream.aggregate({
        _sum: { viewerCount: true },
        where: { isLive: true },
      }),
      db.chatMessage.count(),
    ]);

    return NextResponse.json({
      totalStreams,
      liveStreams,
      totalViewers: totalViewers._sum.viewerCount || 0,
      totalMessages,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}