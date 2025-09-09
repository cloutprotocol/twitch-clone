"use client";

import { TokenData } from "@/lib/token-chart-service";
import { formatMarketCap, formatVolume, getRelativeTime } from "@/lib/token-chart-utils";
import { TradingLinks } from "./trading-links";
import { PriceChart } from "./price-chart";

interface TokenChartWidgetProps {
  data: TokenData;
  tokenAddress: string;
}

export const TokenChartWidget = ({ data, tokenAddress }: TokenChartWidgetProps) => {
  return (
    <div className="p-4 space-y-4">
      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-text-tertiary uppercase tracking-wide">Market Cap</p>
          <p className="text-sm font-semibold text-text-primary">
            {data.marketCap > 0 ? formatMarketCap(data.marketCap) : 'N/A'}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-text-tertiary uppercase tracking-wide">24h Volume</p>
          <p className="text-sm font-semibold text-text-primary">
            {data.volume24h > 0 ? formatVolume(data.volume24h) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Price Chart Placeholder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary uppercase tracking-wide">Price Chart</p>
          <p className="text-xs text-text-tertiary">
            Updated {getRelativeTime(data.lastUpdated)}
          </p>
        </div>
        
        {/* Chart Component */}
        <PriceChart 
          tokenAddress={tokenAddress} 
          currentPrice={data.price}
          tokenSymbol={data.symbol}
        />
      </div>

      {/* Trading Links */}
      <div className="space-y-2">
        <p className="text-xs text-text-tertiary uppercase tracking-wide">Quick Actions</p>
        <TradingLinks tokenAddress={tokenAddress} tokenSymbol={data.symbol} />
      </div>

      {/* Additional Stats */}
      <div className="pt-2 border-t border-border-secondary">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-text-tertiary">Decimals</p>
            <p className="text-text-secondary font-mono">{data.decimals}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-text-tertiary">Last Update</p>
            <p className="text-text-secondary">{getRelativeTime(data.lastUpdated)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};