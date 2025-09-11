import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function DELETE(req: NextRequest) {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tokenAddress } = await req.json();

    if (!tokenAddress || typeof tokenAddress !== "string") {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
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

    // Delete goals for this stream and token combination
    const deletedGoals = await db.goal.deleteMany({
      where: {
        streamId: stream.id,
        tokenAddress: tokenAddress,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deletedGoals.count,
    });
  } catch (error) {
    console.error("Error deleting goals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/stream/goals - Starting request");
    
    const self = await getSelf();
    console.log("User authenticated:", self?.id);
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Request body:", body);
    
    const { goals, tokenAddress } = body;

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { error: "Goals array is required" },
        { status: 400 }
      );
    }

    if (!tokenAddress || typeof tokenAddress !== "string") {
      return NextResponse.json(
        { error: "Token address is required" },
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
    console.log("Looking for stream with userId:", self.id);
    const stream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });
    console.log("Found stream:", stream?.id);

    if (!stream) {
      console.log("No stream found for user");
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    // Delete existing goals for this stream and token combination
    await db.goal.deleteMany({
      where: {
        streamId: stream.id,
        tokenAddress: tokenAddress,
      },
    });

    // Create new goals
    console.log("Creating goals for stream:", stream.id, "token:", tokenAddress);
    const createdGoals = await Promise.all(
      goals.map((goal, index) => {
        const goalData = {
          streamId: stream.id,
          tokenAddress: tokenAddress,
          marketCap: Math.floor(goal.marketCap),
          description: goal.description.trim(),
          order: index + 1,
        };
        console.log("Creating goal:", goalData);
        return db.goal.create({
          data: goalData,
        });
      })
    );
    console.log("Created goals:", createdGoals.length);

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