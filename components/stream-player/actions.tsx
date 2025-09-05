"use client";

import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { onFollow, onUnfollow } from "@/actions/follow";
import { ProfileEditModal } from "./profile-edit-modal";

interface ActionsProps {
  hostIdentity: string;
  isFollowing: boolean;
  isHost: boolean;
  bio?: string | null;
  streamTitle: string;
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

export const Actions = ({
  hostIdentity,
  isFollowing,
  isHost,
  bio,
  streamTitle,
  socialLinks,
}: ActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { userId } = useAuth();

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

  if (isHost) {
    return (
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
    );
  }

  return (
    <Button
      disabled={isPending}
      onClick={toggleFollow}
      variant="primary"
      size="sm"
      className="w-full lg:w-auto"
    >
      <Heart
        className={cn("h-4 w-4 mr-2", isFollowing ? "fill-white" : "fill-none")}
      />
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export const ActionsSkeleton = () => {
  return <Skeleton className="h-10 w-full lg:w-24" />;
};
