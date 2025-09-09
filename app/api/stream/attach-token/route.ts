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

    const { tokenAddress } = await req.json();

    if (!tokenAddress || typeof tokenAddress !== "string") {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    // Basic validation for Solana address format (base58, ~44 characters)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(tokenAddress)) {
      return NextResponse.json(
        { error: "Invalid Solana token address format" },
        { status: 400 }
      );
    }

    // Update the user's stream with the token address
    const updatedStream = await db.stream.update({
      where: {
        userId: self.id,
      },
      data: {
        tokenAddress: tokenAddress.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      tokenAddress: updatedStream.tokenAddress,
    });
  } catch (error) {
    console.error("Error attaching token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const self = await getSelf();
    
    if (!self) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Remove the token address from the user's stream
    const updatedStream = await db.stream.update({
      where: {
        userId: self.id,
      },
      data: {
        tokenAddress: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Token removed successfully",
    });
  } catch (error) {
    console.error("Error removing token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}