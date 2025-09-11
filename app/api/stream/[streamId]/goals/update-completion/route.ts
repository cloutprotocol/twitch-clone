import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const { streamId } = params;
    const { completedGoals, marketCap, tokenAddress } = await req.json();

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

    if (!completedGoals || !Array.isArray(completedGoals)) {
      return NextResponse.json(
        { error: "Completed goals array is required" },
        { status: 400 }
      );
    }

    // Update goals as completed for the specific token
    const updatePromises = completedGoals.map(goalId =>
      db.goal.update({
        where: {
          id: goalId,
          streamId: streamId,
          tokenAddress: tokenAddress,
        },
        data: {
          isReached: true,
          reachedAt: new Date(),
        },
      })
    );

    const updatedGoals = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedGoals: updatedGoals.length,
      marketCap: marketCap,
    });
  } catch (error) {
    console.error("Error updating goal completion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}