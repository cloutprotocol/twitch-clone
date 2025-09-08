"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectionModal({ open, onOpenChange }: WalletConnectionModalProps) {
  const { wallet, publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Auto sign-in when wallet is connected (like pump.fun)
  useEffect(() => {
    if (connected && publicKey && !isLoading) {
      handleAutoSignIn();
    }
  }, [connected, publicKey]);

  const handleAutoSignIn = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    
    try {
      // Sign in with NextAuth using just the wallet address - no signing required
      const result = await signIn("wallet", {
        address: publicKey.toBase58(),
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success("Successfully signed in!");
        onOpenChange(false);
        // Refresh the page to update the auth state
        window.location.reload();
      }
    } catch (error) {
      console.error("Auto sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0e0e10] border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Connect your Solana wallet to sign in securely without passwords
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-400 text-sm">
              Connect your Solana wallet to sign in instantly
            </p>
          </div>

          <div className="space-y-4">
            {!connected ? (
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-green-500 hover:!bg-green-600 !rounded-lg !text-black !font-semibold" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {wallet?.adapter.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {publicKey?.toBase58()}
                      </p>
                    </div>
                  </div>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-green-500" />
                    <span className="text-green-500">Signing you in...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy.
              No message signing required - instant access with your wallet.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}