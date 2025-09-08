"use client";

import { useState, useEffect } from "react";
import { Wallet, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBalance, type WalletBalance as WalletBalanceData } from "@/lib/wallet-utils";

interface WalletBalanceProps {
    className?: string;
    showRefresh?: boolean;
    compact?: boolean;
    showStatus?: boolean; // Show as a status card instead of just balance
}

interface WalletBalanceComponentData {
    wallet: {
        address: string;
        chain: string;
        label?: string | null;
    };
    balance: WalletBalanceData;
}

export const WalletBalance = ({
    className = "",
    showRefresh = false,
    compact = false,
    showStatus = false
}: WalletBalanceProps) => {
    const [data, setData] = useState<WalletBalanceComponentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/wallet/balance', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const balanceData = await response.json();
            setData(balanceData);
        } catch (err) {
            console.error("Failed to fetch wallet balance:", err);
            setError("Failed to load balance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    if (loading) {
        if (showStatus) {
            return (
                <div className={`p-4 bg-background-tertiary/50 border border-border-secondary rounded-xl ${className}`}>
                    <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-text-tertiary animate-pulse" />
                        <div>
                            <p className="text-text-tertiary font-medium">Loading Wallet...</p>
                            <p className="text-xs text-text-tertiary">Fetching balance...</p>
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <Wallet className="w-4 h-4 text-text-tertiary animate-pulse" />
                <div className="text-sm text-text-tertiary">Loading...</div>
            </div>
        );
    }

    if (error || !data) {
        if (showStatus) {
            return (
                <div className={`p-4 bg-status-warning/10 border border-status-warning/20 rounded-xl ${className}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-5 w-5 text-status-warning" />
                            <div>
                                <p className="text-status-warning font-medium">Wallet Error</p>
                                <p className="text-xs text-text-tertiary">
                                    Failed to load wallet information
                                </p>
                            </div>
                        </div>
                        {showRefresh && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-auto"
                                onClick={fetchBalance}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            );
        }
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <Wallet className="w-4 h-4 text-status-error" />
                <div className="text-sm text-status-error">Error</div>
                {showRefresh && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                        onClick={fetchBalance}
                    >
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                )}
            </div>
        );
    }

    const { solFormatted, usdFormatted } = formatBalance(data.balance);

    // Format wallet address for display
    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Status card view (replaces the old wallet status section)
    if (showStatus) {
        return (
            <div className={`p-4 bg-status-success/10 border border-status-success/20 rounded-xl ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-status-success" />
                        <div>
                            <p className="text-status-success font-medium">Wallet Connected</p>
                            <div className="text-sm">
                                <span className="text-text-primary font-medium">{solFormatted} SOL</span>
                                <span className="text-text-tertiary mx-1">|</span>
                                <span className="text-text-tertiary">{usdFormatted}</span>
                            </div>
                            <p className="text-xs text-text-tertiary font-mono">
                                {formatWalletAddress(data.wallet.address)} • {data.wallet.chain.toUpperCase()}
                            </p>
                        </div>
                    </div>
                    {showRefresh && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-auto"
                            onClick={fetchBalance}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Compact view (for navbar)
    if (compact) {
        return (
            <div className={`flex items-center space-x-2 ${className}`}>
                <Wallet className="w-4 h-4 text-interactive-primary" />
                <div className="text-sm">
                    <span className="text-text-primary font-medium">{solFormatted} SOL</span>
                </div>
                {showRefresh && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-auto"
                        onClick={fetchBalance}
                    >
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                )}
            </div>
        );
    }

    // Default view (for token launcher balance display)
    return (
        <div className={`flex items-center space-x-2 bg-background-secondary px-3 py-2 rounded-lg border border-border-primary ${className}`}>
            <Wallet className="w-4 h-4 text-interactive-primary" />
            <div className="text-sm">
                <div className="flex items-center space-x-2">
                    <span className="text-text-primary font-medium">{solFormatted} SOL</span>
                    <span className="text-text-tertiary">|</span>
                    <span className="text-text-tertiary">{usdFormatted}</span>
                </div>
                <div className="text-xs text-text-tertiary font-mono">
                    {formatWalletAddress(data.wallet.address)}
                </div>
            </div>
            {showRefresh && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="p-1 h-auto"
                    onClick={fetchBalance}
                >
                    <RefreshCw className="w-3 h-3" />
                </Button>
            )}
        </div>
    );
};