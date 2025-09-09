"use client";

import { cn } from "@/lib/theme-utils";
import { EnhancedTokenCard } from "./enhanced-token-card";

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
    <div className={cn("transition-all duration-200", className)}>
      <EnhancedTokenCard tokenAddress={tokenAddress} />
    </div>
  );
};



export default TokenChart;