"use client";

import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  tokenAddress: string;
  tokenSymbol: string;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export const TradingViewWidget = ({ 
  tokenAddress, 
  tokenSymbol, 
  className = "" 
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Clean up previous widget
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (error) {
        console.warn('Error removing TradingView widget:', error);
      }
      widgetRef.current = null;
    }

    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    const loadTradingViewWidget = () => {
      if (!window.TradingView || !containerRef.current) return;

      try {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: `RAYDIUM:${tokenSymbol}USD`, // Try Raydium first
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#1a1a1a",
          enable_publishing: false,
          hide_top_toolbar: true,
          hide_legend: true,
          save_image: false,
          container_id: containerRef.current.id,
          height: 300,
          width: "100%",
          studies: [],
          show_popup_button: false,
          popup_width: "1000",
          popup_height: "650",
          no_referral_id: true,
          overrides: {
            "paneProperties.background": "#1a1a1a",
            "paneProperties.vertGridProperties.color": "#2a2a2a",
            "paneProperties.horzGridProperties.color": "#2a2a2a",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#AAA",
            "mainSeriesProperties.candleStyle.wickUpColor": "#00ff88",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ff4444",
          }
        });
      } catch (error) {
        console.error('Error creating TradingView widget:', error);
        // Show fallback message
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-background-tertiary rounded-lg">
              <div class="text-center text-text-tertiary">
                <p class="text-sm">Chart not available</p>
                <p class="text-xs mt-1">Token may not be listed on major exchanges</p>
              </div>
            </div>
          `;
        }
      }
    };

    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = loadTradingViewWidget;
      script.onerror = () => {
        console.error('Failed to load TradingView script');
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-background-tertiary rounded-lg">
              <div class="text-center text-text-tertiary">
                <p class="text-sm">Unable to load chart</p>
                <p class="text-xs mt-1">Please check your internet connection</p>
              </div>
            </div>
          `;
        }
      };
      document.head.appendChild(script);
    } else {
      loadTradingViewWidget();
    }

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.warn('Error cleaning up TradingView widget:', error);
        }
        widgetRef.current = null;
      }
    };
  }, [tokenAddress, tokenSymbol]);

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div
        ref={containerRef}
        id={`tradingview-widget-${tokenAddress}`}
        className="h-64 w-full bg-background-tertiary rounded-lg"
      />
      <div className="text-xs text-text-tertiary text-center mt-2">
        Powered by TradingView
      </div>
    </div>
  );
};