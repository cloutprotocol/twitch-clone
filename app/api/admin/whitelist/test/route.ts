import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Test if WhitelistApplication model exists
    const count = await db.whitelistApplication.count();
    
    // Get a few sample applications
    const applications = await db.whitelistApplication.findMany({
      take: 3,
      select: {
        id: true,
        walletAddress: true,
        status: true,
        streamIdea: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      dbConnection: "OK",
      whitelistApplicationCount: count,
      sampleApplications: applications
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}