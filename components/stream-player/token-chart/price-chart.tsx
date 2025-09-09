"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/token-chart-utils";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { TradingViewWidget } from "./trading-view-widget";
import { Button } from "@/components/ui/button";

interface PriceChartProps {
  tokenAddress: string;
  currentPrice: number;
  tokenSymbol?: string;
}

export const PriceChart = ({ tokenAddress, currentPrice, tokenSymbol = "UNKNOWN" }: PriceChartProps) => {
  const [showTradingView, setShowTradingView] = useState(false);

  // Generate some mock data points for the simple chart
  const generateMockData = () => {
    const points = [];
    const basePrice = currentPrice;
    let price = basePrice * 0.95; // Start 5% below current
    
    for (let i = 0; i < 24; i++) {
      // Random walk with slight upward bias to reach current price
      const change = (Math.random() - 0.45) * 0.02; // Slight upward bias
      price = price * (1 + change);
      points.push({
        time: Date.now() - (24 - i) * 60 * 60 * 1000, // Hours ago
        price: price,
      });
    }
    
    // Ensure last point is current price
    points[points.length - 1].price = currentPrice;
    return points;
  };

  const mockData = generateMockData();
  const priceChange = ((currentPrice - mockData[0].price) / mockData[0].price) * 100;
  const isPositive = priceChange >= 0;

  // Create SVG path for the price line
  const createPath = () => {
    const width = 300;
    const height = 100;
    const padding = 10;
    
    const minPrice = Math.min(...mockData.map(d => d.price));
    const maxPrice = Math.max(...mockData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1;
    
    const points = mockData.map((point, index) => {
      const x = padding + (index / (mockData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  if (showTradingView) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-interactive-primary" />
            <span className="text-sm font-medium text-text-primary">Advanced Chart</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTradingView(false)}
            className="text-xs"
          >
            Simple View
          </Button>
        </div>
        <TradingViewWidget 
          tokenAddress={tokenAddress} 
          tokenSymbol={tokenSymbol}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Chart Container */}
      <div className="relative bg-background-tertiary rounded-lg p-3">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-status-success" />
            ) : priceChange === 0 ? (
              <Minus className="h-4 w-4 text-text-tertiary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-status-error" />
            )}
            <span className="text-sm font-medium text-text-primary">24H Chart</span>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-text-primary">
              {formatPrice(currentPrice)}
            </div>
            <div className={`text-xs ${isPositive ? 'text-status-success' : 'text-status-error'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-24 flex items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 100"
            className="overflow-visible"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="30" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 30 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-border-secondary opacity-30"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Price line */}
            <path
              d={createPath()}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isPositive ? "text-status-success" : "text-status-error"}
            />
            
            {/* Current price dot */}
            <circle
              cx={290}
              cy={50}
              r="3"
              fill="currentColor"
              className={isPositive ? "text-status-success" : "text-status-error"}
            />
          </svg>
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-text-tertiary mt-1">
          <span>24h ago</span>
          <span>12h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Chart Options */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-tertiary">
          📊 Simple price visualization
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTradingView(true)}
          className="text-xs flex items-center gap-1"
        >
          <BarChart3 className="h-3 w-3" />
          Advanced Chart
        </Button>
      </div>
    </div>
  );
};