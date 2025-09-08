"use client";

import { ExternalLink, Github, Instagram, MessageCircle, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedMark } from "@/components/verified-mark";

import { BioModal } from "./bio-modal";
import { SocialLinksModal } from "./social-links-modal";

interface AboutCardProps {
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  bio: string | null;
  followedByCount: number;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    discord?: string;
    telegram?: string;
    twitch?: string;
    website?: string;
  };
}

export const AboutCard = ({
  hostName,
  hostIdentity,
  viewerIdentity,
  bio,
  followedByCount,
  socialLinks,
}: AboutCardProps) => {
  const hostAsViewer = `Host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  const followedByLabel = followedByCount === 1 ? "follower" : "followers";

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'tiktok':
        return <MessageCircle className="w-4 h-4" />; // Using MessageCircle as TikTok icon placeholder
      case 'discord':
        return <MessageCircle className="w-4 h-4" />;
      case 'telegram':
        return <MessageCircle className="w-4 h-4" />;
      case 'twitch':
        return <MessageCircle className="w-4 h-4" />; // Using MessageCircle as Twitch icon placeholder
      case 'website':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getSocialLabel = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'X';
      case 'instagram':
        return 'Instagram';
      case 'tiktok':
        return 'TikTok';
      case 'discord':
        return 'Discord';
      case 'telegram':
        return 'Telegram';
      case 'twitch':
        return 'Twitch';
      case 'website':
        return 'Website';
      default:
        return platform;
    }
  };

  return (
    <div className="px-4">
      <div className="group rounded-xl bg-background p-6 lg:p-10 flex flex-col gap-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2 font-semibold text-lg lg:text-2xl">
            {hostName}
            <VerifiedMark />
          </div>
          {isHost && (
            <div className="flex items-center gap-x-2">
              <BioModal initialValue={bio} />
              <SocialLinksModal
                initialValues={{
                  twitterUrl: socialLinks?.twitter || "",
                  instagramUrl: socialLinks?.instagram || "",
                  tiktokUrl: socialLinks?.tiktok || "",
                  discordUrl: socialLinks?.discord || "",
                  telegramUrl: socialLinks?.telegram || "",
                  twitchUrl: socialLinks?.twitch || "",
                  websiteUrl: socialLinks?.website || "",
                }}
              />
            </div>
          )}
        </div>
        <div className="text-sm text-text-secondary">
          <span className="font-semibold text-primary">{followedByCount}</span>{" "}
          {followedByLabel}
        </div>
        <p className="text-sm">{bio || "This user has not set a bio yet."}</p>
        
        {/* Social Links */}
        {socialLinks && Object.entries(socialLinks).some(([, url]) => url) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null;
              
              return (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-full text-xs"
                  asChild
                >
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    {getSocialIcon(platform)}
                    {getSocialLabel(platform)}
                  </a>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
