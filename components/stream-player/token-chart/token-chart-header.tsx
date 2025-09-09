"use client";

import { TokenData } from "@/lib/token-chart-service";
import { formatPrice, formatPriceChange, truncateAddress } from "@/lib/token-chart-utils";
import { cn } from "@/lib/theme-utils";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/token-chart-utils";

interface TokenChartHeaderProps {
  data: TokenData;
  isStale?: boolean;
}

export const TokenChartHeader = ({ data, isStale = false }: TokenChartHeaderProps) => {
  const priceChange = formatPriceChange(data.priceChange24h);

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(data.address);
    if (success) {
      toast.success("Token address copied to clipboard");
    } else {
      toast.error("Failed to copy address");
    }
  };

  const handleOpenDexScreener = () => {
    window.open(`https://dexscreener.com/solana/${data.address}`, '_blank');
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        {/* Token Info */}
        <div className="flex items-center gap-3">
          {/* Token Logo */}
          <div className="relative">
            {data.logoURI ? (
              <img
                src={data.logoURI}
                alt={`${data.name} logo`}
                className="w-8 h-8 rounded-full bg-background-tertiary"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback placeholder */}
            <div className={cn(
              "w-8 h-8 rounded-full bg-interactive-primary/20 flex items-center justify-center text-xs font-bold text-interactive-primary",
              data.logoURI && "hidden"
            )}>
              {data.symbol.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Token Name and Symbol */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary truncate">
                {data.name}
              </h3>
              <span className="text-sm text-text-secondary font-medium">
                {data.symbol}
              </span>
            </div>
            
            {/* Token Address */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-text-tertiary font-mono">
                {truncateAddress(data.address)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-4 w-4 p-0 text-text-tertiary hover:text-text-secondary"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenDexScreener}
                className="h-4 w-4 p-0 text-text-tertiary hover:text-text-secondary"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg font-bold",
              isStale ? "text-text-secondary" : "text-text-primary"
            )}>
              {formatPrice(data.price)}
            </span>
          </div>
          
          {/* 24h Change */}
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className={cn(
              "text-sm font-medium",
              priceChange.colorClass,
              isStale && "opacity-60"
            )}>
              {priceChange.formatted}
            </span>
            <span className="text-xs text-text-tertiary">24h</span>
          </div>
        </div>
      </div>

      {/* Stale data warning */}
      {isStale && (
        <div className="mt-2 text-xs text-status-warning">
          ⚠️ Price data may be outdated
        </div>
      )}
    </div>
  );
};