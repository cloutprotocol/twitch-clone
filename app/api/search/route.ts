import { NextRequest, NextResponse } from "next/server";
import { getSearch } from "@/lib/search-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.length < 2) {
      return NextResponse.json([]);
    }

    const results = await getSearch(term);
    
    // Limit to 5 results for live preview
    const limitedResults = results.slice(0, 5);
    
    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error("Live search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}