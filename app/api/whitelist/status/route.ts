import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");
    
    // Try to get userId, but don't fail if auth is not available
    let userId: string | null = null;
    try {
      const authResult = auth();
      userId = authResult.userId;
    } catch (authError) {
      // Auth not available, continue without userId
    }
    
    if (!walletAddress && !userId) {
      return NextResponse.json(
        { error: "Wallet address or user authentication required" },
        { status: 400 }
      );
    }

    let application = null;

    if (walletAddress) {
      // Check by wallet address
      application = await db.whitelistApplication.findUnique({
        where: {
          walletAddress: walletAddress
        },
        select: {
          status: true,
          createdAt: true,
          walletAddress: true
        }
      });
    } else if (userId) {
      // Check by user ID
      application = await db.whitelistApplication.findFirst({
        where: {
          userId: userId
        },
        select: {
          status: true,
          createdAt: true,
          walletAddress: true
        }
      });
    }

    return NextResponse.json({
      hasApplication: !!application,
      status: application?.status || null,
      appliedAt: application?.createdAt || null,
      walletAddress: application?.walletAddress || null
    });

  } catch (error) {
    console.error("Error checking whitelist status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}