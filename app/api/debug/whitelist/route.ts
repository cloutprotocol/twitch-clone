import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");
    
    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    // Get the exact application
    const application = await db.whitelistApplication.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    // Also check what the status endpoint returns
    const statusResponse = await fetch(`${req.nextUrl.origin}/api/whitelist/status?wallet=${walletAddress}`);
    const statusData = await statusResponse.json();

    return NextResponse.json({
      debug: {
        searchedWallet: walletAddress,
        directDbResult: application,
        statusEndpointResult: statusData,
        statusEndpointStatus: statusResponse.status
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      error: "Debug failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}