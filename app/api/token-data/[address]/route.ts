import { NextRequest, NextResponse } from "next/server";
import { tokenChartService, TokenChartService } from "@/lib/token-chart-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    // Validate token address format
    if (!TokenChartService.isValidTokenAddress(address)) {
      return NextResponse.json(
        { error: "Invalid token address format" },
        { status: 400 }
      );
    }

    // Fetch token data
    const tokenData = await tokenChartService.getTokenData(address);

    return NextResponse.json({
      success: true,
      data: tokenData,
    });

  } catch (error) {
    console.error(`Error fetching token data for ${params.address}:`, error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch token data",
        success: false 
      },
      { status: 500 }
    );
  }
}