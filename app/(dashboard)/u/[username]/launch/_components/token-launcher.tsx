"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Upload, X, Wallet, CheckCircle } from "lucide-react";
import { CostBreakdown } from "@/components/wallet/cost-breakdown";
import { WalletBalance } from "@/components/wallet/wallet-balance";
import { useWhitelistStatus } from "@/hooks/use-whitelist-status";

interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  image: File | null;
  launchType: "standard" | "twitter-fee-sharing";
  twitterUsername: string;
  creatorFeeBps: number;
  twitterUserFeeBps: number;
  initialBuySOL: number;
  websiteLink: string;
  twitterLink: string;
  telegramLink: string;
}

interface UserWallet {
  id: string;
  address: string;
  chain: string;
  label?: string | null;
  isPrimary: boolean;
}

interface TokenLauncherProps {
  userWallet: UserWallet | null;
}

export const TokenLauncher = ({ userWallet }: TokenLauncherProps) => {
  const { data: session } = useSession();
  const { isApproved, isLoading: whitelistLoading, isPending, hasApplication } = useWhitelistStatus(userWallet?.address || null);
  
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    description: "",
    image: null,
    launchType: "standard",
    twitterUsername: "",
    creatorFeeBps: 1000, // 10%
    twitterUserFeeBps: 9000, // 90%
    initialBuySOL: 0.01,
    websiteLink: "",
    twitterLink: "",
    telegramLink: "",
  });

  const [isLaunching, setIsLaunching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [feeShareWallet, setFeeShareWallet] = useState<string | null>(null);

  const handleInputChange = (field: keyof TokenFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-lookup fee share wallet when username changes
    if (field === "twitterUsername" && typeof value === "string") {
      // Debounce the lookup
      const timeoutId = setTimeout(() => {
        lookupFeeShareWallet(value);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (PNG, JPG, GIF, WebP)");
        return;
      }

      // Validate file size (15MB max)
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast.error("Image must be less than 15MB");
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const lookupFeeShareWallet = async (username: string) => {
    if (!username.trim()) {
      setFeeShareWallet(null);
      return;
    }

    try {
      const response = await fetch("/api/bags/fee-share-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setFeeShareWallet(data.wallet);
        if (data.wallet) {
          toast.success(`Found fee share wallet for @${username}`);
        } else {
          toast.info(`No fee share wallet found for @${username}`);
        }
      } else {
        throw new Error(data.error || "Failed to lookup wallet");
      }
    } catch (error) {
      toast.error("Failed to lookup fee share wallet");
      setFeeShareWallet(null);
    }
  };

  const handleLaunch = async () => {
    if (!session?.user) {
      toast.error("Please sign in to launch tokens");
      return;
    }

    if (!userWallet) {
      toast.error("No wallet found for your account");
      return;
    }

    if (!formData.name || !formData.symbol || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.launchType === "twitter-fee-sharing" && !formData.twitterUsername) {
      toast.error("Twitter username is required for fee sharing");
      return;
    }

    setIsLaunching(true);

    try {
      // Step 1: Create launch data
      const launchData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value) {
          launchData.append(key, value as File);
        } else if (value !== null && value !== "") {
          launchData.append(key, value.toString());
        }
      });

      // Add wallet address from authenticated user
      launchData.append("walletAddress", userWallet.address);

      // Step 2: Get transaction from API
      const response = await fetch("/api/bags/launch", {
        method: "POST",
        body: launchData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create launch transaction");
      }

      // For now, we'll show the transaction that needs to be signed
      // In a full implementation, you'd integrate with a wallet to sign this
      toast.success("Token launch transaction created!");
      toast.info("Transaction signing integration coming soon...");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to launch token");
    } finally {
      setIsLaunching(false);
    }
  };

  // Show loading state while checking whitelist
  if (whitelistLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 h-full overflow-y-auto">
        <Card className="bg-background-secondary border-border-primary">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-interactive-primary" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Checking Whitelist Status...
            </h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show whitelist notice if not approved
  if (!isApproved) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 h-full overflow-y-auto">
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
                  Your whitelist application is being reviewed. You'll be able to launch tokens once approved.
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
                  Rarecube.tv Whitelist Program
                </h3>
                <p className="text-text-secondary mb-4">
                  To launch tokens on rarecube.tv, you need to be approved for our whitelist program.
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

        {/* Greyed out form preview */}
        <div className="opacity-30 pointer-events-none">
        <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Token Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-text-tertiary">Token Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="My Awesome Token"
                className="bg-background-tertiary border-border-secondary text-text-primary"
              />
            </div>
            <div>
              <Label htmlFor="symbol" className="text-text-tertiary">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                placeholder="MAT"
                maxLength={10}
                className="bg-background-tertiary border-border-secondary text-text-primary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-text-tertiary">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your token..."
              rows={3}
              className="bg-background-tertiary border-border-secondary text-text-primary resize-none"
            />
          </div>

          <div>
            <Label className="text-text-tertiary">Token Image (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Token preview"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-highlight-primary"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border-primary rounded-lg cursor-pointer hover:border-interactive-primary transition-colors bg-background-secondary">
                  <Upload className="h-8 w-8 text-interactive-primary" />
                  <span className="text-sm text-text-tertiary">Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1">PNG, JPG, GIF, WebP up to 15MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Launch Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.launchType === "twitter-fee-sharing"}
              onCheckedChange={(checked) =>
                handleInputChange("launchType", checked ? "twitter-fee-sharing" : "standard")
              }
            />
            <Label className="text-text-tertiary">Enable Fee Sharing</Label>
          </div>

          {formData.launchType === "twitter-fee-sharing" && (
            <div className="space-y-4 p-4 bg-background-tertiary/50 rounded-lg border border-border-secondary">
              <div>
                <Label htmlFor="twitterUsername" className="text-text-tertiary">Twitter Username *</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-text-tertiary">@</span>
                  <Input
                    id="twitterUsername"
                    value={formData.twitterUsername}
                    onChange={(e) => handleInputChange("twitterUsername", e.target.value)}
                    placeholder="elonmusk"
                    className="bg-background-tertiary border-border-secondary text-text-primary"
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">Enter just the username (no @ or links)</p>
                
                {feeShareWallet && (
                  <div className="mt-2 p-2 bg-status-success/10 border border-status-success/20 rounded text-xs">
                    <p className="text-status-success">✓ Fee share wallet found</p>
                    <p className="text-text-tertiary font-mono break-all">{feeShareWallet}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-tertiary">You: <span className="text-text-primary font-medium">{(formData.creatorFeeBps / 100).toFixed(1)}%</span></span>
                  <span className="text-text-tertiary">Them: <span className="text-text-primary font-medium">{(formData.twitterUserFeeBps / 100).toFixed(1)}%</span></span>
                </div>
                <Slider
                  value={[formData.creatorFeeBps]}
                  onValueChange={([value]) => {
                    handleInputChange("creatorFeeBps", value);
                    handleInputChange("twitterUserFeeBps", 10000 - value);
                  }}
                  max={9500}
                  min={500}
                  step={100}
                  className="mt-2"
                />
                <p className="text-xs text-text-tertiary mt-2">
                  The Twitter user will receive {(formData.twitterUserFeeBps / 100).toFixed(1)}% of fees, you get {(formData.creatorFeeBps / 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="initialBuy" className="text-text-tertiary">Initial Buy (SOL)</Label>
            <Input
              id="initialBuy"
              type="number"
              value={formData.initialBuySOL}
              onChange={(e) => handleInputChange("initialBuySOL", parseFloat(e.target.value) || 0)}
              min="0.001"
              step="0.001"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Recommended minimum 0.2 SOL to avoid snipers. Leave ~0.05 SOL for transaction fees.
            </p>
            
            {/* Cost Breakdown */}
            <CostBreakdown 
              initialBuySOL={formData.initialBuySOL} 
              className="mt-3"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Social Links (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label htmlFor="website" className="text-text-tertiary">Website</Label>
            <Input
              id="website"
              value={formData.websiteLink}
              onChange={(e) => handleInputChange("websiteLink", e.target.value)}
              placeholder="https://mytoken.com"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="text-text-tertiary">Twitter</Label>
            <Input
              id="twitter"
              value={formData.twitterLink}
              onChange={(e) => handleInputChange("twitterLink", e.target.value)}
              placeholder="https://twitter.com/mytoken"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
          <div>
            <Label htmlFor="telegram" className="text-text-tertiary">Telegram</Label>
            <Input
              id="telegram"
              value={formData.telegramLink}
              onChange={(e) => handleInputChange("telegramLink", e.target.value)}
              placeholder="https://t.me/mytoken"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Status & Balance */}
      {session?.user && userWallet ? (
        <WalletBalance 
          showStatus={true}
          showRefresh={true}
        />
      ) : (
        <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-status-warning" />
            <div>
              <p className="text-status-warning font-medium">No Wallet Found</p>
              <p className="text-xs text-text-tertiary">
                Please contact support if you see this message
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleLaunch}
        disabled={isLaunching || !session?.user || !userWallet}
        className="w-full py-6 bg-interactive-primary hover:bg-interactive-hover disabled:bg-interactive-disabled text-text-inverse font-semibold text-lg"
        size="lg"
      >
        {isLaunching ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Launching Token...
          </>
        ) : !session?.user ? (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            Sign In Required
          </>
        ) : !userWallet ? (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            No Wallet Found
          </>
        ) : (
          "Launch Token"
        )}
      </Button>

      {/* Powered by Bags Footer */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <a 
          href="https://bags.fm" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-text-tertiary hover:text-text-secondary transition-colors text-sm"
        >
          <span>Powered by</span>
          <img 
            src="https://bags.fm/assets/images/bags-icon.png" 
            alt="Bags" 
            className="w-4 h-4"
          />
          <span className="font-medium">Bags</span>
        </a>
      </div>
        </div>
      </div>
    );
  }

  // Show full functional form if approved
  return (
    <div className="max-w-4xl mx-auto space-y-4 h-full overflow-y-auto">
      {/* Success notice for approved users */}
      <Card className="bg-status-success/10 border-status-success/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-status-success" />
            <div>
              <p className="text-status-success font-medium">Whitelist Approved</p>
              <p className="text-xs text-text-tertiary">
                You can now launch tokens on rarecube.tv
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Token Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-text-tertiary">Token Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="My Awesome Token"
                className="bg-background-tertiary border-border-secondary text-text-primary"
              />
            </div>
            <div>
              <Label htmlFor="symbol" className="text-text-tertiary">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                placeholder="MAT"
                maxLength={10}
                className="bg-background-tertiary border-border-secondary text-text-primary"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-text-tertiary">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your token..."
              rows={3}
              className="bg-background-tertiary border-border-secondary text-text-primary resize-none"
            />
          </div>

          <div>
            <Label className="text-text-tertiary">Token Image (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Token preview"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-highlight-primary"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border-primary rounded-lg cursor-pointer hover:border-interactive-primary transition-colors bg-background-secondary">
                  <Upload className="h-8 w-8 text-interactive-primary" />
                  <span className="text-sm text-text-tertiary">Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1">PNG, JPG, GIF, WebP up to 15MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Launch Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.launchType === "twitter-fee-sharing"}
              onCheckedChange={(checked) =>
                handleInputChange("launchType", checked ? "twitter-fee-sharing" : "standard")
              }
            />
            <Label className="text-text-tertiary">Enable Fee Sharing</Label>
          </div>

          {formData.launchType === "twitter-fee-sharing" && (
            <div className="space-y-4 p-4 bg-background-tertiary/50 rounded-lg border border-border-secondary">
              <div>
                <Label htmlFor="twitterUsername" className="text-text-tertiary">Twitter Username *</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-text-tertiary">@</span>
                  <Input
                    id="twitterUsername"
                    value={formData.twitterUsername}
                    onChange={(e) => handleInputChange("twitterUsername", e.target.value)}
                    placeholder="elonmusk"
                    className="bg-background-tertiary border-border-secondary text-text-primary"
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1">Enter just the username (no @ or links)</p>
                
                {feeShareWallet && (
                  <div className="mt-2 p-2 bg-status-success/10 border border-status-success/20 rounded text-xs">
                    <p className="text-status-success">✓ Fee share wallet found</p>
                    <p className="text-text-tertiary font-mono break-all">{feeShareWallet}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-text-tertiary">You: <span className="text-text-primary font-medium">{(formData.creatorFeeBps / 100).toFixed(1)}%</span></span>
                  <span className="text-text-tertiary">Them: <span className="text-text-primary font-medium">{(formData.twitterUserFeeBps / 100).toFixed(1)}%</span></span>
                </div>
                <Slider
                  value={[formData.creatorFeeBps]}
                  onValueChange={([value]) => {
                    handleInputChange("creatorFeeBps", value);
                    handleInputChange("twitterUserFeeBps", 10000 - value);
                  }}
                  max={9500}
                  min={500}
                  step={100}
                  className="mt-2"
                />
                <p className="text-xs text-text-tertiary mt-2">
                  The Twitter user will receive {(formData.twitterUserFeeBps / 100).toFixed(1)}% of fees, you get {(formData.creatorFeeBps / 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="initialBuy" className="text-text-tertiary">Initial Buy (SOL)</Label>
            <Input
              id="initialBuy"
              type="number"
              value={formData.initialBuySOL}
              onChange={(e) => handleInputChange("initialBuySOL", parseFloat(e.target.value) || 0)}
              min="0.001"
              step="0.001"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
            <p className="text-xs text-text-tertiary mt-1">
              Recommended minimum 0.2 SOL to avoid snipers. Leave ~0.05 SOL for transaction fees.
            </p>
            
            {/* Cost Breakdown */}
            <CostBreakdown 
              initialBuySOL={formData.initialBuySOL} 
              className="mt-3"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-text-primary text-xl">Social Links (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label htmlFor="website" className="text-text-tertiary">Website</Label>
            <Input
              id="website"
              value={formData.websiteLink}
              onChange={(e) => handleInputChange("websiteLink", e.target.value)}
              placeholder="https://mytoken.com"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="text-text-tertiary">Twitter</Label>
            <Input
              id="twitter"
              value={formData.twitterLink}
              onChange={(e) => handleInputChange("twitterLink", e.target.value)}
              placeholder="https://twitter.com/mytoken"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
          <div>
            <Label htmlFor="telegram" className="text-text-tertiary">Telegram</Label>
            <Input
              id="telegram"
              value={formData.telegramLink}
              onChange={(e) => handleInputChange("telegramLink", e.target.value)}
              placeholder="https://t.me/mytoken"
              className="bg-background-tertiary border-border-secondary text-text-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wallet Status & Balance */}
      {session?.user && userWallet ? (
        <WalletBalance 
          showStatus={true}
          showRefresh={true}
        />
      ) : (
        <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-xl">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-status-warning" />
            <div>
              <p className="text-status-warning font-medium">No Wallet Found</p>
              <p className="text-xs text-text-tertiary">
                Please contact support if you see this message
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleLaunch}
        disabled={isLaunching || !session?.user || !userWallet}
        className="w-full py-6 bg-interactive-primary hover:bg-interactive-hover disabled:bg-interactive-disabled text-text-inverse font-semibold text-lg"
        size="lg"
      >
        {isLaunching ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Launching Token...
          </>
        ) : !session?.user ? (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            Sign In Required
          </>
        ) : !userWallet ? (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            No Wallet Found
          </>
        ) : (
          "Launch Token"
        )}
      </Button>

      {/* Powered by Bags Footer */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <a 
          href="https://bags.fm" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-text-tertiary hover:text-text-secondary transition-colors text-sm"
        >
          <span>Powered by</span>
          <img 
            src="https://bags.fm/assets/images/bags-icon.png" 
            alt="Bags" 
            className="w-4 h-4"
          />
          <span className="font-medium">Bags</span>
        </a>
      </div>
    </div>
  );
};