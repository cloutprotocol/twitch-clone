"use client";

import { cn } from "@/lib/theme-utils";
import { TokenInfoCard } from "./token-info-card";
import { TestDexScreener } from "./test-dexscreener";

interface TokenChartProps {
  tokenAddress: string;
  streamId: string;
  className?: string;
}

export const TokenChart = ({ tokenAddress, streamId, className }: TokenChartProps) => {
  // Don't render if no token address
  if (!tokenAddress) {
    return null;
  }

  return (
    <div className={cn("space-y-4 transition-all duration-200", className)}>
      <TokenInfoCard tokenAddress={tokenAddress} />
      <TestDexScreener defaultTokenAddress={tokenAddress} />
    </div>
  );
};



export default TokenChart;