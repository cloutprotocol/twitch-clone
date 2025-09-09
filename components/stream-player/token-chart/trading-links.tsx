"use client";

import { generateTradingLinks } from "@/lib/token-chart-utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowUpDown, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TradingLinksProps {
  tokenAddress: string;
  tokenSymbol: string;
}

export const TradingLinks = ({ tokenAddress, tokenSymbol }: TradingLinksProps) => {
  const links = generateTradingLinks(tokenAddress);

  const handleLinkClick = (url: string, platform: string) => {
    // Show disclaimer toast
    toast.info(`Opening ${platform}. Always verify token addresses before trading.`, {
      duration: 3000,
    });
    
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      {/* Trading Platforms */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLinkClick(links.jupiter, 'Jupiter')}
          className="flex items-center gap-2 text-xs"
        >
          <ArrowUpDown className="h-3 w-3" />
          Jupiter
          <ExternalLink className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLinkClick(links.raydium, 'Raydium')}
          className="flex items-center gap-2 text-xs"
        >
          <ArrowUpDown className="h-3 w-3" />
          Raydium
          <ExternalLink className="h-3 w-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLinkClick(links.dexscreener, 'DexScreener')}
          className="flex items-center gap-2 text-xs"
        >
          <BarChart3 className="h-3 w-3" />
          Charts
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-2 bg-status-warning/10 border border-status-warning/20 rounded text-xs">
        <AlertTriangle className="h-3 w-3 text-status-warning flex-shrink-0 mt-0.5" />
        <div className="text-text-tertiary">
          <p className="font-medium text-status-warning mb-1">Trading Disclaimer</p>
          <p>
            Always verify token addresses and do your own research. 
            Trading cryptocurrencies involves significant risk of loss.
          </p>
        </div>
      </div>
    </div>
  );
};