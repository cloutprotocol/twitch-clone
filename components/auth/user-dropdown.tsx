"use client";

import { LogOut, User, Wallet, Copy, BarChart3, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { TokenControls } from "@/components/dashboard/token-controls";

interface UserDropdownProps {
  user: {
    id: string;
    username: string;
    email?: string | null;
    image?: string | null;
    imageUrl?: string;
  };
  tokenAddress?: string | null;
}

export function UserDropdown({ user, tokenAddress }: UserDropdownProps) {
  const { data: session } = useSession();
  const [realWalletAddress, setRealWalletAddress] = useState<string | null>(null);
  
  // Get wallet address from session or use username as fallback for display
  const displayUsername = session?.user?.username || user.username;
  const displayAddress = displayUsername?.length > 8 
    ? `${displayUsername.slice(0, 4)}...${displayUsername.slice(-4)}`
    : displayUsername;

  // Fetch real wallet address
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/wallet');
          const data = await response.json();
          if (data.wallet?.address) {
            setRealWalletAddress(data.wallet.address);
          }
        } catch (error) {
          console.error('Failed to fetch wallet address:', error);
        }
      }
    };

    fetchWalletAddress();
  }, [session?.user?.id]);

  const copyAddress = () => {
    const addressToCopy = realWalletAddress || displayUsername;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-background-secondary/90 backdrop-blur-sm hover:bg-background-tertiary border-border-primary text-text-primary flex items-center gap-2 px-2 py-1 h-auto rounded-lg min-h-[32px]"
        >
          <UserAvatar
            username={user.username}
            imageUrl={user.imageUrl || user.image || ""}
            size="xs"
          />
          <span className="text-sm font-medium">{displayAddress}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-background-secondary border-border-primary" align="end">
        <DropdownMenuItem asChild className="text-text-primary hover:bg-background-tertiary cursor-pointer">
          <Link href={`/u/${user.username}`} className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-text-primary hover:bg-background-tertiary cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem className="text-text-primary hover:bg-background-tertiary cursor-pointer">
          <Wallet className="mr-2 h-4 w-4" />
          View Wallet
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-text-primary hover:bg-background-tertiary cursor-pointer"
          onClick={copyAddress}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy address
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border-primary" />
        
        <DropdownMenuItem
          className="cursor-pointer text-status-error hover:bg-background-tertiary hover:text-status-error"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}