"use client";

import { useState } from "react";
import { StartStreamCard } from "./start-stream-card";
import { WalletConnectionModal } from "@/components/auth/wallet-connection-modal";

interface StartStreamWrapperProps {
  isLoggedIn: boolean;
  username?: string;
}

export const StartStreamWrapper = ({ isLoggedIn, username }: StartStreamWrapperProps) => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletConnect = () => {
    setShowWalletModal(true);
  };

  return (
    <>
      <StartStreamCard 
        isLoggedIn={isLoggedIn} 
        username={username}
        onWalletConnect={handleWalletConnect} 
      />
      
      <WalletConnectionModal 
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </>
  );
};