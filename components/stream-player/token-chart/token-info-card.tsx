"use client";

import { useHeliusToken } from "@/hooks/use-helius-token";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Share, Star, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard, truncateAddress } from "@/lib/token-chart-utils";

interface TokenInfoCardProps {
  tokenAddress: string;
  className?: string;
}

export const TokenInfoCard = ({ tokenAddress, className = "" }: TokenInfoCardProps) => {
  const { data, loading, error } = useHeliusToken(tokenAddress);

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(tokenAddress);
    if (success) {
      toast.success("Token address copied to clipboard");
    } else {
      toast.error("Failed to copy address");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.name || 'Token'} (${data?.symbol || 'UNKNOWN'})`,
          text: `Check out this token: ${data?.name || 'Token'}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        handleCopyAddress();
      }
    } else {
      // Fallback to copying URL
      const success = await copyToClipboard(window.location.href);
      if (success) {
        toast.success("Stream URL copied to clipboard");
      }
    }
  };

  const handleOpenDexScreener = () => {
    window.open(`https://dexscreener.com/solana/${tokenAddress}`, '_blank');
  };

  if (loading) {
    return (
      <Card className={`bg-background-secondary border-border-primary ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-background-secondary border-border-primary ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background-tertiary rounded-lg flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary">Token Not Found</h3>
              <p className="text-sm text-text-tertiary">Unable to load token information</p>
              <p className="text-xs text-text-tertiary font-mono mt-1">
                {truncateAddress(tokenAddress)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className={`bg-background-secondary border-border-primary ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Token Logo */}
          <div className="relative">
            {data.logoURI ? (
              <img
                src={data.logoURI}
                alt={`${data.name} logo`}
                className="w-16 h-16 rounded-lg object-cover bg-background-tertiary border-2 border-interactive-primary"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            
            {/* Fallback logo */}
            <div className={`w-16 h-16 rounded-lg bg-interactive-primary/20 flex items-center justify-center text-lg font-bold text-interactive-primary border-2 border-interactive-primary ${data.logoURI ? 'hidden' : ''}`}>
              {data.symbol.slice(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">
              {data.name}
            </h3>
            <p className="text-sm font-medium text-text-secondary">
              {data.symbol}
            </p>
            
            {/* Token Details */}
            <div className="flex items-center gap-4 mt-1 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-status-success rounded-full"></span>
                {data.decimals} decimals
              </span>
              <span>3h ago</span>
            </div>
            
            {/* Token Address */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-text-tertiary font-mono">
                {truncateAddress(tokenAddress)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="h-4 w-4 p-0 text-text-tertiary hover:text-text-secondary"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleShare}
              className="bg-status-success hover:bg-status-success/80 text-white px-4 py-2 text-sm font-medium"
            >
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDexScreener}
              className="p-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Supply Info */}
        {data.supply && (
          <div className="mt-3 pt-3 border-t border-border-secondary">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">Total Supply</span>
              <span className="text-text-primary font-medium">
                {data.supply.toLocaleString()} {data.symbol}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};