"use client";

import { useState, useEffect } from "react";
import { heliusTokenService, HeliusTokenData, HeliusTokenService } from "@/lib/helius-token-service";

export function useHeliusToken(tokenAddress: string | null) {
  const [data, setData] = useState<HeliusTokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenAddress) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!HeliusTokenService.isValidTokenAddress(tokenAddress)) {
      setError("Invalid token address");
      setLoading(false);
      return;
    }

    console.log(`[useHeliusToken] Starting fetch for: ${tokenAddress}`);
    setLoading(true);
    setError(null);

    heliusTokenService.getTokenData(tokenAddress)
      .then((tokenData) => {
        console.log(`[useHeliusToken] Received data:`, tokenData);
        setData(tokenData);
        setError(null);
      })
      .catch((err) => {
        console.error(`[useHeliusToken] Error:`, err);
        setError(err.message || "Failed to fetch token data");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [tokenAddress]);

  return { data, loading, error };
}