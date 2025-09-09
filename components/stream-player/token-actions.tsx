"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Coins, Rocket, Loader2, X } from "lucide-react";

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

interface TokenActionsProps {
  hostIdentity: string;
  isHost: boolean;
  tokenAddress?: string | null;
}

export const TokenActions = ({
  hostIdentity,
  isHost,
  tokenAddress,
}: TokenActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  if (!isHost) {
    return null;
  }

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
          setIsOpen(false);
          setContractAddress("");
          // Refresh the page to show the updated token
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
          // Refresh the page to show the updated state
          window.location.reload();
        } else {
          toast.error(data.error || "Failed to remove token");
        }
      } catch (error) {
        toast.error("Failed to remove token");
      }
    });
  };

  // If token is already attached, show remove button
  if (tokenAddress) {
    return (
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveToken}
          disabled={isPending}
          className="flex items-center gap-2 text-status-error border-status-error hover:bg-status-error/10"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <X className="h-4 w-4" />
              Remove Token
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Attach Token
          </Button>
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
                onClick={() => setIsOpen(false)}
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

      <Button
        variant="default"
        size="sm"
        onClick={handleLaunchToken}
        className="flex items-center gap-2"
      >
        <Rocket className="h-4 w-4" />
        Launch Token
      </Button>
    </div>
  );
};