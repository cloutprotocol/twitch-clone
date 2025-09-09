import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { goals } = await req.json();

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { error: "Goals array is required" },
        { status: 400 }
      );
    }

    // Validate goals format
    for (const goal of goals) {
      if (!goal.marketCap || typeof goal.marketCap !== "number" || goal.marketCap <= 0) {
        return NextResponse.json(
          { error: "Each goal must have a valid market cap value" },
          { status: 400 }
        );
      }
      if (!goal.description || typeof goal.description !== "string" || goal.description.trim().length === 0) {
        return NextResponse.json(
          { error: "Each goal must have a description" },
          { status: 400 }
        );
      }
    }

    // Get the user's stream
    const stream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Delete existing goals for this stream
    await db.goal.deleteMany({
      where: {
        streamId: stream.id,
      },
    });

    // Create new goals
    const createdGoals = await Promise.all(
      goals.map((goal, index) =>
        db.goal.create({
          data: {
            streamId: stream.id,
            marketCap: Math.floor(goal.marketCap),
            description: goal.description.trim(),
            order: index + 1,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      goals: createdGoals,
    });
  } catch (error) {
    console.error("Error saving goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}