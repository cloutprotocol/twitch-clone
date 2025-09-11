"use client";

import { UserIcon, Heart } from "lucide-react";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useParticipants,
  useRemoteParticipant,
} from "@livekit/components-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/verified-mark";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";
import { cn } from "@/lib/theme-utils";
import { onFollow, onUnfollow } from "@/actions/follow";

import { ProfileEditModal } from "./profile-edit-modal";
import { TokenControls } from "@/components/dashboard/token-controls";

interface StreamHeaderProps {
  imageUrl: string;
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  isFollowing: boolean;
  streamTitle: string;
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

export const StreamHeader = ({
  imageUrl,
  hostName,
  hostIdentity,
  viewerIdentity,
  isFollowing,
  streamTitle,
  bio,
  followedByCount,
  tokenAddress,
  socialLinks,
}: StreamHeaderProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);

  const isLive = !!participant;
  const participantCount = participants.length - 1;

  const hostAsViewer = `Host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  const handleFollow = () => {
    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      onUnfollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const toggleFollow = () => {
    if (!userId) {
      return router.push("/sign-in");
    }

    if (isHost) return;

    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {/* Smaller User Avatar */}
        <UserAvatar
          imageUrl={imageUrl}
          username={hostName}
          size="default"
          isLive={isLive}
          showBadge
        />
        
        <div className="space-y-1">
          {/* Stream Title Only */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {streamTitle}
            </h1>
            <VerifiedMark />
          </div>
          
          {/* Streamlined Stats */}
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            {isLive ? (
              <div className="flex items-center gap-1 text-status-success">
                <div className="w-2 h-2 bg-status-success rounded-full animate-pulse"></div>
                <span className="font-medium">
                  {participantCount} {participantCount === 1 ? "viewer" : "viewers"}
                </span>
              </div>
            ) : (
              <span className="text-text-secondary">Offline</span>
            )}
            
            <span className="text-text-tertiary">
              {followedByCount} {followedByCount === 1 ? "follower" : "followers"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions - Only show Follow for non-hosts, Edit Profile for hosts */}
      <div className="flex items-center gap-2">
        {!isHost && (
          <Button
            disabled={isPending}
            onClick={toggleFollow}
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className="px-3 text-sm h-7"
          >
            <Heart
              className={cn("h-3 w-3 mr-1.5", isFollowing ? "fill-white" : "fill-none")}
            />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
        
        {isHost && (
          <>
            <TokenControls 
              tokenAddress={tokenAddress}
              className="mr-2"
            />
            <ProfileEditModal
              initialValues={{
                bio: bio || "",
                streamTitle: streamTitle,
                twitterUrl: socialLinks?.twitter || "",
                instagramUrl: socialLinks?.instagram || "",
                tiktokUrl: socialLinks?.tiktok || "",
                discordUrl: socialLinks?.discord || "",
                telegramUrl: socialLinks?.telegram || "",
                twitchUrl: socialLinks?.twitch || "",
                websiteUrl: socialLinks?.website || "",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export const StreamHeaderSkeleton = () => {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <UserAvatarSkeleton size="default" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
};