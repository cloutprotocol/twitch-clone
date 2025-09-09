"use client";

import { useState } from "react";
import { useHeliusToken } from "@/hooks/use-helius-token";
import { useSharedTokenData } from "@/hooks/use-shared-token-data";
import { TokenPriceData } from "@/lib/dexscreener-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Share, ExternalLink, Copy, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard, truncateAddress } from "@/lib/token-chart-utils";

interface EnhancedTokenCardProps {
    tokenAddress: string;
    className?: string;
}

export const EnhancedTokenCard = ({ tokenAddress, className = "" }: EnhancedTokenCardProps) => {
    const { data: heliusData, loading: heliusLoading, error: heliusError } = useHeliusToken(tokenAddress);
    const { priceData, isLoading: priceLoading, error: priceError, refresh } = useSharedTokenData(tokenAddress);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);

    // Debug logging
    console.log('Token Card - Shared Data:', {
        tokenAddress,
        priceData,
        isLoading: priceLoading,
        error: priceError
    });

    // Data fetching is now handled by useSharedTokenData hook

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
                    title: `${heliusData?.name || 'Token'} (${heliusData?.symbol || 'UNKNOWN'})`,
                    text: `Check out this token: ${heliusData?.name || 'Token'}`,
                    url: window.location.href,
                });
            } catch (error) {
                handleCopyAddress();
            }
        } else {
            const success = await copyToClipboard(window.location.href);
            if (success) {
                toast.success("Stream URL copied to clipboard");
            }
        }
    };

    const handleOpenDexScreener = () => {
        window.open(`https://dexscreener.com/solana/${tokenAddress}`, '_blank');
    };

    const handleManualRefresh = async () => {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime;
        const cooldownTime = 5000; // 5 seconds cooldown

        if (timeSinceLastRefresh < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - timeSinceLastRefresh) / 1000);
            toast.error(`Please wait ${remainingTime}s before refreshing again`);
            return;
        }

        setIsRefreshing(true);
        setLastRefreshTime(now);

        try {
            // Use shared refresh function - this updates both token card and goals display
            await refresh();
            toast.success("Token data refreshed");
        } catch (error) {
            toast.error("Failed to refresh token data");
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatPrice = (price: number) => {
        if (price < 0.01) return price.toFixed(6);
        if (price < 1) return price.toFixed(4);
        return price.toFixed(2);
    };

    const formatLargeNumber = (num: number) => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toFixed(2);
    };

    const isLoading = heliusLoading || priceLoading;
    const hasError = heliusError || priceError;

    if (isLoading) {
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
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (hasError && !heliusData && !priceData) {
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

    return (
        <Card className={`bg-background-secondary border-border-primary ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Token Logo */}
                    <div className="relative">
                        {heliusData?.logoURI ? (
                            <img
                                src={heliusData.logoURI}
                                alt={`${heliusData.name} logo`}
                                className="w-16 h-16 rounded-lg object-cover bg-background-tertiary border-2 border-interactive-primary"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : null}

                        {/* Fallback logo */}
                        <div className={`w-16 h-16 rounded-lg bg-interactive-primary/20 flex items-center justify-center text-lg font-bold text-interactive-primary border-2 border-interactive-primary ${heliusData?.logoURI ? 'hidden' : ''}`}>
                            {(heliusData?.symbol || 'UN').slice(0, 2).toUpperCase()}
                        </div>
                    </div>

                    {/* Token Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-text-primary truncate">
                            {heliusData?.name || 'Unknown Token'}
                        </h3>
                        <p className="text-sm font-medium text-text-secondary">
                            {heliusData?.symbol || 'UNKNOWN'}
                        </p>

                        {/* Token Details */}
                        <div className="flex items-center gap-4 mt-1 text-xs text-text-tertiary">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-status-success rounded-full"></span>
                                {heliusData?.decimals || 9} decimals
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
                            onClick={handleManualRefresh}
                            disabled={isRefreshing || priceLoading}
                            className="p-2"
                            title="Refresh token data"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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

                {/* Price Information */}
                {priceData && (
                    <div className="mt-4 pt-4 border-t border-border-secondary space-y-4">
                        {/* Main Price Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Current Price */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">Current Price</p>
                                <p className="text-xl font-bold text-text-primary">
                                    ${formatPrice(priceData.price)}
                                </p>
                            </div>

                            {/* 24h Change */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">24h Change</p>
                                <div className="flex items-center gap-1">
                                    {priceData.priceChange24h >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-status-success" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-status-error" />
                                    )}
                                    <p className={`text-lg font-bold ${priceData.priceChange24h >= 0 ? 'text-status-success' : 'text-status-error'
                                        }`}>
                                        {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            {/* Market Cap */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">Market Cap</p>
                                <p className="text-sm font-semibold text-text-primary">
                                    ${formatLargeNumber(priceData.marketCap)}
                                </p>
                            </div>

                            {/* 24h Volume */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">24h Volume</p>
                                <p className="text-sm font-semibold text-text-primary">
                                    ${formatLargeNumber(priceData.volume24h)}
                                </p>
                            </div>

                            {/* Liquidity */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">Liquidity</p>
                                <p className="text-sm font-semibold text-text-primary">
                                    ${formatLargeNumber(priceData.liquidity)}
                                </p>
                            </div>

                            {/* DEX */}
                            <div className="space-y-1">
                                <p className="text-xs text-text-tertiary uppercase tracking-wide">DEX</p>
                                <p className="text-sm font-semibold text-text-primary capitalize">
                                    {priceData.dexId}
                                </p>
                            </div>
                        </div>

                        {/* Trading Links */}
                        <div className="space-y-2">
                            <p className="text-xs text-text-tertiary uppercase tracking-wide">Quick Trade</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://jup.ag/swap/SOL-${tokenAddress}`, '_blank')}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    Jupiter
                                    <ExternalLink className="h-3 w-3" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${tokenAddress}`, '_blank')}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    Raydium
                                    <ExternalLink className="h-3 w-3" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenDexScreener}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    Charts
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Trading Disclaimer */}
                            <div className="p-2 bg-status-warning/10 border border-status-warning/20 rounded text-xs">
                                <p className="text-status-warning font-medium mb-1">⚠️ Trading Disclaimer</p>
                                <p className="text-text-tertiary">
                                    Always verify token addresses and do your own research.
                                    Trading cryptocurrencies involves significant risk of loss.
                                </p>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="pt-3 border-t border-border-secondary">
                            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">Technical Details</p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">Pair Address:</span>
                                    <span className="text-text-secondary font-mono">
                                        {priceData.pairAddress.slice(0, 8)}...{priceData.pairAddress.slice(-8)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">DEX:</span>
                                    <span className="text-text-secondary capitalize">{priceData.dexId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-tertiary">Decimals:</span>
                                    <span className="text-text-secondary">{heliusData?.decimals || 9}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Supply Info */}
                {heliusData?.supply && (
                    <div className="mt-3 pt-3 border-t border-border-secondary">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-tertiary">Total Supply</span>
                            <span className="text-text-primary font-medium">
                                {heliusData.supply.toLocaleString()} {heliusData.symbol}
                            </span>
                        </div>
                    </div>
                )}

                {/* DEX Info */}
                {priceData && (
                    <div className="mt-2 text-xs text-text-tertiary text-center">
                        Price data from {priceData.dexId}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};