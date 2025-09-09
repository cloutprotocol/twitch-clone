import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    // Fetch goals for the stream
    const goals = await db.goal.findMany({
      where: {
        streamId: streamId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      goals: goals,
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}