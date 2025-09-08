"use client";

import { useState, useEffect } from "react";
import { calculateLaunchCost } from "@/lib/wallet-utils";

interface CostBreakdownProps {
  initialBuySOL: number;
  className?: string;
}

export const CostBreakdown = ({ initialBuySOL, className = "" }: CostBreakdownProps) => {
  const [solPrice, setSolPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        const response = await fetch('/api/wallet/sol-price');
        const data = await response.json();
        setSolPrice(data.price || 0);
      } catch (error) {
        console.error("Failed to fetch SOL price:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolPrice();
  }, []);

  const costs = calculateLaunchCost(initialBuySOL);
  const totalUSD = loading ? 0 : costs.total * solPrice;

  if (initialBuySOL <= 0) {
    return null;
  }

  return (
    <div className={`space-y-2 p-3 bg-background-secondary rounded-lg border border-border-primary ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-text-tertiary">Initial buy:</span>
        <span className="text-text-primary">{costs.initialBuy.toFixed(3)} SOL</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-tertiary">Est. transaction fees:</span>
        <span className="text-text-primary">~{costs.transactionFees.toFixed(3)} SOL</span>
      </div>
      <div className="border-t border-border-secondary pt-2 flex justify-between text-sm font-medium">
        <span className="text-text-primary">Total cost:</span>
        <div className="text-right">
          <div className="text-text-primary">{costs.total.toFixed(3)} SOL</div>
          {!loading && solPrice > 0 && (
            <div className="text-text-tertiary text-xs">
              {totalUSD.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};