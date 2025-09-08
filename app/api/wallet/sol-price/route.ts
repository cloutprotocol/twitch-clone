import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch SOL price');
    }
    
    const data = await response.json();
    const solPrice = data.solana?.usd || 0;
    
    return NextResponse.json({ 
      price: solPrice,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Failed to fetch SOL price:", error);
    return NextResponse.json({ 
      price: 0,
      error: "Failed to fetch price" 
    }, { status: 500 });
  }
}