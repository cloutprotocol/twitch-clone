"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

export default function WhitelistApplicationPage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    walletAddress: connected && publicKey ? publicKey.toString() : "",
    twitterUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    discordUrl: "",
    telegramUrl: "",
    websiteUrl: "",
    tokenAddress: "",
    streamIdea: "",
    additionalNotes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.walletAddress) {
      toast.error("Wallet address is required");
      return;
    }

    if (!formData.streamIdea.trim()) {
      toast.error("Stream idea is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/whitelist/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      toast.success("Application submitted successfully! We'll review it and get back to you.");
      router.push("/");
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit application";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Banner Image */}
      <div className="w-full aspect-video relative overflow-hidden">
        <Image
          src="/tv-wall.png"
          alt="TV Wall Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {/* <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Join the Stream
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Apply for streaming access on rarecube.tv
            </p> */}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="w-full px-4 py-12 bg-background-primary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Join The Stream
            </h2>
            <p className="text-text-secondary text-lg">
              Tell us about yourself and your streaming plans
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Wallet Address */}
            <div className="space-y-3">
              <Label htmlFor="walletAddress" className="text-text-primary text-lg font-medium">
                Wallet Address *
              </Label>
              <Input
                id="walletAddress"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange("walletAddress", e.target.value)}
                placeholder="Your Solana wallet address"
                className="bg-background-secondary border-border-primary text-text-primary h-12 text-base"
                required
              />
              {connected && publicKey && (
                <p className="text-sm text-text-secondary">
                  Auto-filled from connected wallet
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-text-primary">Social Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="twitterUrl" className="text-text-primary font-medium">Twitter/X</Label>
                  <Input
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="instagramUrl" className="text-text-primary font-medium">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="tiktokUrl" className="text-text-primary font-medium">TikTok</Label>
                  <Input
                    id="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={(e) => handleInputChange("tiktokUrl", e.target.value)}
                    placeholder="https://tiktok.com/@username"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="discordUrl" className="text-text-primary font-medium">Discord</Label>
                  <Input
                    id="discordUrl"
                    value={formData.discordUrl}
                    onChange={(e) => handleInputChange("discordUrl", e.target.value)}
                    placeholder="https://discord.gg/invite or username#1234"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="telegramUrl" className="text-text-primary font-medium">Telegram</Label>
                  <Input
                    id="telegramUrl"
                    value={formData.telegramUrl}
                    onChange={(e) => handleInputChange("telegramUrl", e.target.value)}
                    placeholder="https://t.me/username"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="websiteUrl" className="text-text-primary font-medium">Website</Label>
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="bg-background-secondary border-border-primary text-text-primary h-12"
                  />
                </div>
              </div>
            </div>

            {/* Token Address */}
            <div className="space-y-3">
              <Label htmlFor="tokenAddress" className="text-text-primary text-lg font-medium">
                Token Address (Optional)
              </Label>
              <Input
                id="tokenAddress"
                value={formData.tokenAddress}
                onChange={(e) => handleInputChange("tokenAddress", e.target.value)}
                placeholder="Solana token contract address you want to stream"
                className="bg-background-secondary border-border-primary text-text-primary h-12 text-base"
              />
              <p className="text-sm text-text-secondary">
                If you have a specific token you want to feature in your streams
              </p>
            </div>

            {/* Stream Idea */}
            <div className="space-y-3">
              <Label htmlFor="streamIdea" className="text-text-primary text-lg font-medium">
                Stream Idea *
              </Label>
              <Textarea
                id="streamIdea"
                value={formData.streamIdea}
                onChange={(e) => handleInputChange("streamIdea", e.target.value)}
                placeholder="Describe what you plan to stream about, your content style, and what makes your streams unique..."
                className="bg-background-secondary border-border-primary text-text-primary min-h-[120px] text-base"
                required
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-3">
              <Label htmlFor="additionalNotes" className="text-text-primary text-lg font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                placeholder="Any additional information you'd like us to know..."
                className="bg-background-secondary border-border-primary text-text-primary min-h-[100px] text-base"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 h-12 text-base"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 text-base bg-interactive-primary hover:bg-interactive-primary/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
