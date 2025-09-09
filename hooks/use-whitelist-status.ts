"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface WhitelistStatus {
  hasApplication: boolean;
  status: "pending" | "approved" | "rejected" | null;
  appliedAt: string | null;
  walletAddress: string | null;
}

export const useWhitelistStatus = () => {
  const { publicKey, connected } = useWallet();
  const [status, setStatus] = useState<WhitelistStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async (walletAddress?: string) => {
    if (!walletAddress && (!connected || !publicKey)) return;
    
    setLoading(true);
    try {
      const wallet = walletAddress || publicKey?.toString();
      const response = await fetch(`/api/whitelist/status?wallet=${wallet}`);
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error checking whitelist status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && publicKey) {
      checkStatus();
    }
  }, [connected, publicKey]);

  return {
    status,
    loading,
    checkStatus,
    isWhitelisted: status?.status === "approved",
    isPending: status?.status === "pending",
    isRejected: status?.status === "rejected"
  };
};