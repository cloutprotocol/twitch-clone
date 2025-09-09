import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;
    const { marketCap } = await req.json();

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    if (typeof marketCap !== 'number') {
      return NextResponse.json(
        { error: "Market cap is required" },
        { status: 400 }
      );
    }

    // Mark all goals that should be completed based on current market cap
    const updatedGoals = await db.goal.updateMany({
      where: {
        streamId: streamId,
        marketCap: {
          lte: marketCap, // Less than or equal to current market cap
        },
        isReached: false, // Only update goals that aren't already marked as reached
      },
      data: {
        isReached: true,
        reachedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updatedGoalsCount: updatedGoals.count,
      marketCap: marketCap,
    });
  } catch (error) {
    console.error("Error marking goals as completed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}