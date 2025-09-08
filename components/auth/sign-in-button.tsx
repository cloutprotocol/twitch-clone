"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { WalletConnectionModal } from "./wallet-connection-modal";
import { Wallet } from "lucide-react";

interface SignInButtonProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function SignInButton({ className, size = "default" }: SignInButtonProps) {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  if (status === "loading") {
    return (
      <Button disabled className={className} size={size}>
        Loading...
      </Button>
    );
  }

  if (session) {
    return null; // User is already signed in
  }

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className={`bg-interactive-primary hover:bg-interactive-hover text-text-inverse font-semibold ${className}`}
        size={size}
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>

      <WalletConnectionModal 
        open={showModal} 
        onOpenChange={setShowModal} 
      />
    </>
  );
}