import { useState, useEffect } from "react";

interface WhitelistStatus {
  hasApplication: boolean;
  status: string | null;
  appliedAt: string | null;
  walletAddress: string | null;
}

export const useWhitelistStatus = (walletAddress: string | null) => {
  const [status, setStatus] = useState<WhitelistStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/whitelist/status?wallet=${walletAddress}`);
        
        if (!response.ok) {
          throw new Error("Failed to check whitelist status");
        }

        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkWhitelistStatus();
  }, [walletAddress]);

  const isApproved = status?.status === "approved";
  const isPending = status?.status === "pending";
  const hasApplication = status?.hasApplication || false;

  return {
    status,
    isLoading,
    error,
    isApproved,
    isPending,
    hasApplication,
    refetch: () => {
      if (walletAddress) {
        setIsLoading(true);
        // Re-trigger the effect
        setStatus(null);
      }
    }
  };
};