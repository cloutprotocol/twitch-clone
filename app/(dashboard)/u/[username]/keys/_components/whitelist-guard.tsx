"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, X, Wallet } from "lucide-react";
import { useWhitelistStatus } from "@/hooks/use-whitelist-status";

interface UserWallet {
  id: string;
  address: string;
  chain: string;
  label?: string | null;
  isPrimary: boolean;
}

interface WhitelistGuardProps {
  userWallet: UserWallet | null;
  children: ReactNode;
}

export const WhitelistGuard = ({ userWallet, children }: WhitelistGuardProps) => {
  const { isApproved, isLoading: whitelistLoading, isPending, hasApplication } = useWhitelistStatus(userWallet?.address || null);

  // Show loading state while checking whitelist
  if (whitelistLoading) {
    return (
      <Card className="bg-background-secondary border-border-primary">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-interactive-primary" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Checking Whitelist Status...
          </h3>
        </CardContent>
      </Card>
    );
  }

  // Show whitelist notice if not approved
  if (!isApproved) {
    return (
      <div className="space-y-4">
        {/* Whitelist Application Notice */}
        <Card className="bg-background-secondary border-border-primary">
          <CardContent className="p-6 text-center">
            {isPending ? (
              <>
                <CheckCircle className="h-12 w-12 text-status-warning mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Whitelist Application Pending
                </h3>
                <p className="text-text-secondary mb-4">
                  Your whitelist application is being reviewed. You'll be able to access streaming keys once approved.
                </p>
              </>
            ) : hasApplication ? (
              <>
                <X className="h-12 w-12 text-status-error mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Whitelist Application Not Approved
                </h3>
                <p className="text-text-secondary mb-4">
                  Your whitelist application was not approved. Please contact support for more information.
                </p>
              </>
            ) : (
              <>
                <Wallet className="h-12 w-12 text-interactive-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Streaming Keys Require Whitelist Approval
                </h3>
                <p className="text-text-secondary mb-4">
                  To access streaming keys and URLs on rarecube.tv, you need to be approved for our whitelist program.
                </p>
                <Button
                  onClick={() => window.location.href = '/whitelist'}
                  className="bg-interactive-primary hover:bg-interactive-hover text-text-inverse font-semibold px-8 py-3"
                >
                  Apply for Whitelist
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Greyed out preview */}
        <div className="opacity-30 pointer-events-none space-y-4">
          <Card className="bg-background-secondary border-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Server URL</h3>
                  <p className="text-xs text-text-tertiary">Your streaming server endpoint</p>
                </div>
                <div className="text-xs text-text-tertiary">Hidden until approved</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-background-secondary border-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">Stream Key</h3>
                  <p className="text-xs text-text-tertiary">Your private streaming key</p>
                </div>
                <div className="text-xs text-text-tertiary">Hidden until approved</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show success notice and full content if approved
  return (
    <div className="space-y-4">
      {/* Success notice for approved users */}
      <Card className="bg-status-success/10 border-status-success/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-status-success" />
            <div>
              <p className="text-status-success font-medium">Whitelist Approved</p>
              <p className="text-xs text-text-tertiary">
                You can now access your streaming keys and URLs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full functional content */}
      {children}
    </div>
  );
};