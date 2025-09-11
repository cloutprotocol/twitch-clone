import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;
    const { searchParams } = new URL(req.url);
    const tokenAddress = searchParams.get('tokenAddress');

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID is required" },
        { status: 400 }
      );
    }

    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    // Fetch goals for the stream and specific token
    const goals = await db.goal.findMany({
      where: {
        streamId: streamId,
        tokenAddress: tokenAddress,
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