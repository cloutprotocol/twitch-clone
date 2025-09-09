import { NextRequest, NextResponse } from "next/server";

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

    // Basic validation for Solana address format
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(address)) {
      return NextResponse.json(
        { error: "Invalid Solana token address format" },
        { status: 400 }
      );
    }

    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (!heliusApiKey) {
      return NextResponse.json(
        { error: "Helius API key not configured" },
        { status: 500 }
      );
    }

    try {
      // Step 1: Get token supply and metadata from Helius DAS API
      const heliusResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-asset',
          method: 'getAsset',
          params: {
            id: address,
          },
        }),
      });

      if (!heliusResponse.ok) {
        throw new Error(`Helius API request failed: ${heliusResponse.status}`);
      }

      const heliusData = await heliusResponse.json();
      
      if (heliusData.error) {
        return NextResponse.json(
          { error: "Token not found", marketCap: 0 },
          { status: 200 }
        );
      }

      const asset = heliusData.result;
      const supply = parseInt(asset?.token_info?.supply || "0");
      const decimals = asset?.token_info?.decimals || 9;

      // Step 2: Get token price from Jupiter API
      let tokenPriceInSol = 0;
      try {
        const jupiterResponse = await fetch(`https://price.jup.ag/v4/price?ids=${address}`);
        if (jupiterResponse.ok) {
          const jupiterData = await jupiterResponse.json();
          const priceData = jupiterData.data?.[address];
          if (priceData?.price) {
            // Jupiter returns price in USD, convert to SOL
            const solPriceResponse = await fetch('https://price.jup.ag/v4/price?ids=So11111111111111111111111111111111111111112');
            if (solPriceResponse.ok) {
              const solPriceData = await solPriceResponse.json();
              const solPriceUsd = solPriceData.data?.["So11111111111111111111111111111111111111112"]?.price || 0;
              if (solPriceUsd > 0) {
                tokenPriceInSol = priceData.price / solPriceUsd;
              }
            }
          }
        }
      } catch (jupiterError) {
        console.log("Jupiter API unavailable, trying alternative...");
      }

      // Step 3: If Jupiter fails, try DexScreener API as fallback
      if (tokenPriceInSol === 0) {
        try {
          const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
          if (dexScreenerResponse.ok) {
            const dexData = await dexScreenerResponse.json();
            const pairs = dexData.pairs || [];
            const solPair = pairs.find((pair: any) => 
              pair.baseToken?.address === address && 
              pair.quoteToken?.symbol === 'SOL'
            );
            
            if (solPair && solPair.priceNative) {
              tokenPriceInSol = parseFloat(solPair.priceNative);
            }
          }
        } catch (dexError) {
          console.log("DexScreener API unavailable");
        }
      }

      // Step 4: Get current SOL price in USD
      let solPriceUsd = 0;
      try {
        const solPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        if (solPriceResponse.ok) {
          const solPriceData = await solPriceResponse.json();
          solPriceUsd = solPriceData.solana?.usd || 0;
        }
      } catch (solPriceError) {
        console.log("Failed to fetch SOL price, using fallback");
        solPriceUsd = 150; // Fallback SOL price
      }

      // Step 5: Calculate market cap
      const adjustedSupply = supply / Math.pow(10, decimals);
      const marketCapUsd = tokenPriceInSol * solPriceUsd * adjustedSupply;
      
      return NextResponse.json({
        marketCap: Math.round(marketCapUsd),
        supply: adjustedSupply,
        tokenPriceInSol: tokenPriceInSol,
        solPriceUsd: solPriceUsd,
        tokenAddress: address,
        lastUpdated: new Date().toISOString(),
      });
      
    } catch (heliusError) {
      console.error("Market cap calculation error:", heliusError);
      return NextResponse.json(
        { error: "Failed to fetch token data", marketCap: 0 },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error("Error fetching market cap:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}