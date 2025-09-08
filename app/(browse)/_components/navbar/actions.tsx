import Link from "next/link";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSelf } from "@/lib/auth-service";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";
import { WalletBalance } from "@/components/wallet/wallet-balance";

export const Actions = async () => {
  const user = await getSelf().catch(() => null);
  const primaryWallet = user?.wallets?.find(wallet => wallet.isPrimary) || user?.wallets?.[0];

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      <TwitchStyleThemeToggle />
      
      {!user && (
        <SignInButton size="sm" />
      )}
      {!!user && (
        <div className="flex items-center gap-x-2 lg:gap-x-4">
          {primaryWallet && (
            <div className="hidden sm:block">
              <WalletBalance 
                compact={true}
                className="text-xs lg:text-sm"
              />
            </div>
          )}
          
          <Button
            size="sm"
            className="bg-interactive-primary hover:bg-interactive-hover text-text-inverse font-semibold"
            asChild
          >
            <Link href={`/u/${user.username}/launch`}>
              <Rocket className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:block">Launch</span>
            </Link>
          </Button>
          
          <UserDropdown user={user} />
        </div>
      )}
    </div>
  );
};
