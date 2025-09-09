"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Coins, Rocket, Loader2, X, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TokenControlsProps {
  tokenAddress?: string | null;
  className?: string;
}

export const TokenControls = ({ tokenAddress, className }: TokenControlsProps) => {
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const handleAttachToken = () => {
    if (!contractAddress.trim()) {
      toast.error("Please enter a valid contract address");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/stream/attach-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenAddress: contractAddress.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Token attached successfully!");
          setIsAttachOpen(false);
          setContractAddress("");
          window.location.reload();
        } else {
          toast.error(data.error || "Failed to attach token");
        }
      } catch (error) {
        toast.error("Failed to attach token");
      }
    });
  };

  const handleLaunchToken = () => {
    if (user?.username) {
      router.push(`/u/${user.username}/launch`);
    }
  };

  const handleRemoveToken = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/stream/attach-token", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Token removed successfully!");
          window.location.reload();
        } else {
          toast.error(data.error || "Failed to remove token");
        }
      } catch (error) {
        toast.error("Failed to remove token");
      }
    });
  };

  // If no token is attached, show launch and attach options
  if (!tokenAddress) {
    return (
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Token Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-background-secondary border-border-primary" align="end">
            <DropdownMenuItem 
              className="text-text-primary hover:bg-background-tertiary cursor-pointer"
              onClick={handleLaunchToken}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Launch New Token
            </DropdownMenuItem>
            
            <Dialog open={isAttachOpen} onOpenChange={setIsAttachOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-text-primary hover:bg-background-tertiary cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Coins className="mr-2 h-4 w-4" />
                  Attach Existing Token
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Attach Solana Token</DialogTitle>
                  <DialogDescription>
                    Enter the contract address of your existing Solana token to attach it to your stream.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contract-address">Contract Address</Label>
                    <Input
                      id="contract-address"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="Enter Solana contract address..."
                      className="mt-1"
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      This should be a valid Solana token contract address
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAttachOpen(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAttachToken}
                      disabled={isPending || !contractAddress.trim()}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Attaching...
                        </>
                      ) : (
                        "Attach Token"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // If token is attached, show manage options
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage Token
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-background-secondary border-border-primary" align="end">
          <DropdownMenuItem 
            className="text-status-error hover:bg-background-tertiary cursor-pointer"
            onClick={handleRemoveToken}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <X className="mr-2 h-4 w-4" />
                Remove Token
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-border-primary" />
          
          <DropdownMenuItem 
            className="text-text-primary hover:bg-background-tertiary cursor-pointer"
            onClick={handleLaunchToken}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Launch Another Token
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};