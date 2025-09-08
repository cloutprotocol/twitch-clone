"use client";

import { LogOut, User, Wallet, Copy, BarChart3, ChevronDown } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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

interface UserDropdownProps {
  user: {
    id: string;
    username: string;
    email?: string | null;
    image?: string | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { data: session } = useSession();
  
  // Get wallet address from session or use username as fallback
  const walletAddress = session?.user?.username || user.username;
  const displayAddress = walletAddress?.length > 8 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : walletAddress;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-background-secondary hover:bg-background-tertiary border-border-primary text-text-primary flex items-center gap-2 px-3 py-2 h-auto"
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Wallet className="w-3 h-3 text-black" />
          </div>
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