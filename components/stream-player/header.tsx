"use client";

import { UserIcon, ExternalLink, Twitter, Instagram, MessageCircle } from "lucide-react";
import {
  useParticipants,
  useRemoteParticipant,
} from "@livekit/components-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/verified-mark";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";

import { Actions, ActionsSkeleton } from "./actions";

interface HeaderProps {
  imageUrl: string;
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  isFollowing: boolean;
  name: string;
  bio?: string | null;
  followedByCount: number;
  tokenAddress?: string | null;
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

export const Header = ({
  imageUrl,
  hostName,
  hostIdentity,
  viewerIdentity,
  isFollowing,
  name,
  bio,
  followedByCount,
  tokenAddress,
  socialLinks,
}: HeaderProps) => {
  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);

  const isLive = !!participant;
  const participantCount = participants.length - 1;

  const hostAsViewer = `Host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  const followedByLabel = followedByCount === 1 ? "follower" : "followers";

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-3 h-3" />;
      case 'instagram':
        return <Instagram className="w-3 h-3" />;
      case 'tiktok':
      case 'discord':
      case 'telegram':
      case 'twitch':
        return <MessageCircle className="w-3 h-3" />;
      case 'website':
        return <ExternalLink className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
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
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between px-4">
      <div className="flex items-start gap-x-3 flex-1">
        <UserAvatar
          imageUrl={imageUrl}
          username={hostName}
          size="lg"
          isLive={isLive}
          showBadge
        />
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-x-2">
            <h2 className="text-lg font-semibold">{hostName}</h2>
            <VerifiedMark />
          </div>
          <p className="text-sm font-semibold">{name}</p>
          {isLive ? (
            <div className="font-semibold flex gap-x-1 items-center text-xs text-rose-500">
              <UserIcon className="h-4 w-4" />
              <p>
                {participantCount}{" "}
                {participantCount === 1 ? "viewer" : "viewers"}
              </p>
            </div>
          ) : (
            <p className="font-semibold text-xs text-text-secondary">
              Offline
            </p>
          )}
          
          {/* About Section */}
          <div className="space-y-2 pt-1">
            <div className="text-xs text-text-secondary">
              <span className="font-semibold text-primary">{followedByCount}</span>{" "}
              {followedByLabel}
            </div>
            {bio && (
              <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                {bio}
              </p>
            )}
            
            {/* Social Links */}
            {socialLinks && Object.entries(socialLinks).some(([, url]) => url) && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  
                  return (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 rounded-full text-xs"
                      asChild
                    >
                      <a
                        href={url.startsWith('http') ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
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
      </div>
      <Actions
        isFollowing={isFollowing}
        hostIdentity={hostIdentity}
        isHost={isHost}
        bio={bio}
        streamTitle={name}
        tokenAddress={tokenAddress}
        socialLinks={socialLinks}
      />
    </div>
  );
};

export const HeaderSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between px-4">
      <div className="flex items-center gap-x-2">
        <UserAvatarSkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <ActionsSkeleton />
    </div>
  );
};
