"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Loader2, Upload, X, Twitter } from "lucide-react";

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
  privateKey: string;
}

export const TokenLauncher = () => {
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
    privateKey: "",
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
      console.error("Fee share wallet lookup error:", error);
      toast.error("Failed to lookup fee share wallet");
      setFeeShareWallet(null);
    }
  };

  const handleLaunch = async () => {
    if (!formData.name || !formData.symbol || !formData.description || !formData.privateKey) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.launchType === "twitter-fee-sharing" && !formData.twitterUsername) {
      toast.error("Twitter username is required for fee sharing");
      return;
    }

    setIsLaunching(true);

    try {
      const launchData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value) {
          launchData.append(key, value as File);
        } else if (value !== null && value !== "") {
          launchData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/bags/launch", {
        method: "POST",
        body: launchData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Token launched successfully!");
        // Reset form or redirect
      } else {
        toast.error(result.error || "Failed to launch token");
      }
    } catch (error) {
      toast.error("Failed to launch token");
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Token Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-400">Token Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="My Awesome Token"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="symbol" className="text-gray-400">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                placeholder="MAT"
                maxLength={10}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-400">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your token..."
              rows={3}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
          </div>

          <div>
            <Label className="text-gray-400">Token Image (Optional)</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Token preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
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
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-800/50">
                  <Upload className="h-8 w-8 text-green-500" />
                  <span className="text-sm text-gray-400">Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 15MB</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Launch Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.launchType === "twitter-fee-sharing"}
              onCheckedChange={(checked) =>
                handleInputChange("launchType", checked ? "twitter-fee-sharing" : "standard")
              }
            />
            <Label className="text-gray-400">Enable Fee Sharing</Label>
          </div>

          {formData.launchType === "twitter-fee-sharing" && (
            <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div>
                <Label htmlFor="twitterUsername" className="text-gray-400">Twitter Username *</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-400">@</span>
                  <Input
                    id="twitterUsername"
                    value={formData.twitterUsername}
                    onChange={(e) => handleInputChange("twitterUsername", e.target.value)}
                    placeholder="elonmusk"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter just the username (no @ or links)</p>
                
                {feeShareWallet && (
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                    <p className="text-green-400">✓ Fee share wallet found</p>
                    <p className="text-gray-400 font-mono break-all">{feeShareWallet}</p>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">You: <span className="text-white font-medium">{(formData.creatorFeeBps / 100).toFixed(1)}%</span></span>
                  <span className="text-gray-400">Them: <span className="text-white font-medium">{(formData.twitterUserFeeBps / 100).toFixed(1)}%</span></span>
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
                <p className="text-xs text-gray-500 mt-2">
                  The Twitter user will receive {(formData.twitterUserFeeBps / 100).toFixed(1)}% of fees, you get {(formData.creatorFeeBps / 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="initialBuy" className="text-gray-400">Initial Buy (SOL)</Label>
            <Input
              id="initialBuy"
              type="number"
              value={formData.initialBuySOL}
              onChange={(e) => handleInputChange("initialBuySOL", parseFloat(e.target.value) || 0)}
              min="0.001"
              step="0.001"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended minimum 0.2 SOL to avoid snipers. Leave ~0.05 SOL for transaction fees.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Social Links (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website" className="text-gray-400">Website</Label>
            <Input
              id="website"
              value={formData.websiteLink}
              onChange={(e) => handleInputChange("websiteLink", e.target.value)}
              placeholder="https://mytoken.com"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="twitter" className="text-gray-400">Twitter</Label>
            <Input
              id="twitter"
              value={formData.twitterLink}
              onChange={(e) => handleInputChange("twitterLink", e.target.value)}
              placeholder="https://twitter.com/mytoken"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label htmlFor="telegram" className="text-gray-400">Telegram</Label>
            <Input
              id="telegram"
              value={formData.telegramLink}
              onChange={(e) => handleInputChange("telegramLink", e.target.value)}
              placeholder="https://t.me/mytoken"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-yellow-400">Wallet Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Label htmlFor="privateKey" className="text-yellow-400">Private Key (Temporary) *</Label>
            <Input
              id="privateKey"
              type="password"
              value={formData.privateKey}
              onChange={(e) => handleInputChange("privateKey", e.target.value)}
              placeholder="Your base58 encoded private key"
              className="bg-gray-800 border-gray-700 text-white mt-1"
            />
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ This will be replaced with global Solana wallet connection. Never share your private key.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleLaunch}
        disabled={isLaunching}
        className="w-full py-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-black font-semibold text-lg"
        size="lg"
      >
        {isLaunching ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Launching Token...
          </>
        ) : (
          "Launch Token"
        )}
      </Button>
    </div>
  );
};