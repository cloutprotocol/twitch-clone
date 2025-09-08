"use client";

import { WalletBalance } from "@/components/wallet/wallet-balance";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { SignInButton } from "@/components/auth/sign-in-button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const FloatingWallet = () => {
  const { data: session } = useSession();
  const [userWallet, setUserWallet] = useState<string | null>(null);

  // Fetch user wallet information
  useEffect(() => {
    const fetchUserWallet = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/wallet');
          const data = await response.json();
          if (data.wallet) {
            setUserWallet(data.wallet.address);
          }
        } catch (error) {
          console.error('Failed to fetch user wallet:', error);
        }
      }
    };

    fetchUserWallet();
  }, [session?.user?.id]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {!session?.user && (
        <div className="bg-background-secondary/90 backdrop-blur-sm border border-border-primary rounded-lg px-2 py-1">
          <SignInButton 
            size="sm" 
            className="!bg-transparent !text-text-primary !border-none !p-1 !h-auto text-xs font-medium hover:!bg-interactive-primary/10"
          />
        </div>
      )}
      
      {session?.user && (
        <>
          {userWallet && (
            <WalletBalance 
              compact={true}
              className="text-xs bg-background-secondary/90 backdrop-blur-sm border border-border-primary rounded-lg px-2 py-1"
            />
          )}
          <UserDropdown user={session.user} />
        </>
      )}
    </div>
  );
};