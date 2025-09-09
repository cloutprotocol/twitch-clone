import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    const body = await req.json();
    const {
      walletAddress,
      twitterUrl,
      instagramUrl,
      tiktokUrl,
      discordUrl,
      telegramUrl,
      websiteUrl,
      tokenAddress,
      streamIdea,
      additionalNotes
    } = body;

    // Validate required fields
    if (!walletAddress || !streamIdea) {
      return NextResponse.json(
        { error: "Wallet address and stream idea are required" },
        { status: 400 }
      );
    }

    // Check if application already exists for this wallet
    const existingApplication = await db.whitelistApplication.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "An application already exists for this wallet address" },
        { status: 409 }
      );
    }

    // Create the whitelist application
    const application = await db.whitelistApplication.create({
      data: {
        walletAddress,
        twitterUrl: twitterUrl || null,
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        discordUrl: discordUrl || null,
        telegramUrl: telegramUrl || null,
        websiteUrl: websiteUrl || null,
        tokenAddress: tokenAddress || null,
        streamIdea,
        additionalNotes: additionalNotes || null,
        userId: userId || null,
        status: "pending"
      }
    });

    return NextResponse.json({
      success: true,
      applicationId: application.id
    });

  } catch (error) {
    console.error("Error creating whitelist application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}