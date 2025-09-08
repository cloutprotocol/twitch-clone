"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";
import { WalletBalance } from "@/components/wallet/wallet-balance";

export const Actions = () => {
  const { data: session } = useSession();
  const { collapsed, onExpand, onCollapse } = useCreatorSidebar((state) => state);
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

  const handleMenuClick = () => {
    if (collapsed) {
      onExpand();
    } else {
      onCollapse();
    }
  };

  return (
    <div className="flex items-center justify-end gap-x-2">
      <TwitchStyleThemeToggle />
      
      {userWallet && (
        <div className="hidden md:block">
          <WalletBalance 
            compact={true}
            showRefresh={true}
            className="text-xs lg:text-sm"
          />
        </div>
      )}
      
      {/* Mobile menu button - only show on mobile */}
      <Button
        size="sm"
        variant="ghost"
        className="lg:hidden p-2"
        onClick={handleMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        className="text-text-secondary hover:text-primary hidden sm:flex"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5 mr-2" />
          Exit
        </Link>
      </Button>
      
      {/* Mobile-only exit button without text */}
      <Button
        size="sm"
        variant="ghost"
        className="text-text-secondary hover:text-primary sm:hidden p-2"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5" />
        </Link>
      </Button>
      
      {session?.user && (
        <UserDropdown user={session.user} />
      )}
    </div>
  );
};
