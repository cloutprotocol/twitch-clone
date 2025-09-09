import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if application already exists
    const existingApplication = await db.whitelistApplication.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    if (existingApplication) {
      // Update existing application to approved
      const updatedApplication = await db.whitelistApplication.update({
        where: {
          walletAddress: walletAddress
        },
        data: {
          status: "approved",
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Existing application approved",
        application: updatedApplication
      });
    } else {
      // Create new application and approve it
      const newApplication = await db.whitelistApplication.create({
        data: {
          walletAddress,
          streamIdea: "Admin approved wallet",
          status: "approved"
        }
      });

      return NextResponse.json({
        success: true,
        message: "New application created and approved",
        application: newApplication
      });
    }

  } catch (error) {
    console.error("Error approving wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}