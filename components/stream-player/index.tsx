"use client";

import { Stream, User } from "@prisma/client";
import { LiveKitRoom } from "@livekit/components-react";
import { cn } from "@/lib/theme-utils";
import { useChatSidebar } from "@/store/use-chat-sidebar";
import { useViewerToken } from "@/hooks/use-viewer-token";
import { ChatToggle } from "./chat-toggle";
import { Chat, ChatSkeleton } from "./chat";
import { Video, VideoSkeleton } from "./video";
import { Header, HeaderSkeleton } from "./header";
import { StreamHeader, StreamHeaderSkeleton } from "./stream-header";
import { ViewerTracker } from "./viewer-tracker";
import { TokenChart } from "./token-chart";
import { GoalsDisplay } from "../stream/goals-display";

type CustomStream = {
  id: string;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  isLive: boolean;
  thumbnail: string | null;
  title: string;
  tokenAddress?: string | null;
};

type CustomUser = {
  id: string;
  username: string;
  bio: string | null;
  stream: CustomStream | null;
  imageUrl: string;
  _count: { followedBy: number };
  twitterUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  discordUrl: string | null;
  telegramUrl: string | null;
  twitchUrl: string | null;
  websiteUrl: string | null;
};

interface ChatMessage {
  id: string;
  content: string;
  username: string;
  userId?: string;
  createdAt: Date;
  user?: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

interface StreamPlayerProps {
  user: CustomUser;
  stream: CustomStream;
  isFollowing: boolean;
  isOwner?: boolean;
  chatMessages?: ChatMessage[];
}

export const StreamPlayer = ({
  user,
  stream,
  isFollowing,
  isOwner = false,
  chatMessages = [],
}: StreamPlayerProps) => {
  const { token, name, identity } = useViewerToken(user.id);
  const { collapsed } = useChatSidebar((state) => state);

  if (!token || !name || !identity) {
    return <StreamPlayerSkeleton />;
  }
  return (
    <>
      {collapsed && (
        <div className="hidden lg:block fixed top-[100px] right-2 z-50">
          <ChatToggle />
        </div>
      )}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!}
        className={cn(
          "grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 h-full",
          collapsed && "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
        )}
      >
        <ViewerTracker
          streamId={stream.id}
          hostIdentity={user.id}
          viewerIdentity={identity}
        />
        <div className="col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 h-[calc(100vh-80px)] lg:overflow-y-auto hidden-scrollbar">
          {/* Stream Header - Above Video */}
          <div className="px-4 pt-4">
            <StreamHeader
              hostName={user.username}
              hostIdentity={user.id}
              viewerIdentity={identity}
              imageUrl={user.imageUrl}
              isFollowing={isFollowing}
              streamTitle={stream.title}
              bio={user.bio}
              followedByCount={user._count.followedBy}
              tokenAddress={stream.tokenAddress}
              socialLinks={{
                twitter: user.twitterUrl ?? undefined,
                instagram: user.instagramUrl ?? undefined,
                tiktok: user.tiktokUrl ?? undefined,
                discord: user.discordUrl ?? undefined,
                telegram: user.telegramUrl ?? undefined,
                twitch: user.twitchUrl ?? undefined,
                website: user.websiteUrl ?? undefined,
              }}
            />
          </div>
          
          {/* Video Player - Same Width as Token Chart */}
          <div className="px-4 mt-4">
            <Video hostName={user.username} hostIdentity={user.id} streamId={stream.id} showThumbnailControls={isOwner} />
          </div>
          
          {/* Token Chart - Below Video */}
          {stream.tokenAddress && (
            <div className="px-4 pt-4 pb-10">
              <TokenChart 
                tokenAddress={stream.tokenAddress}
                streamId={stream.id}
              />
            </div>
          )}
        </div>
        <div className={cn("col-span-1 flex flex-col h-[calc(100vh-80px)]", collapsed && "hidden")}>
          {/* Goals Display - Above Chat */}
          {stream.tokenAddress && (
            <div className="mb-2 flex-shrink-0">
              <GoalsDisplay 
                streamId={stream.id}
                tokenAddress={stream.tokenAddress}
              />
            </div>
          )}
          
          {/* Chat - Fixed height with scrollbar */}
          <div className="flex-1 min-h-0">
            <Chat
              viewerName={name}
              hostName={user.username}
              hostIdentity={user.id}
              isFollowing={isFollowing}
              isChatEnabled={stream.isChatEnabled}
              isChatDelayed={stream.isChatDelayed}
              isChatFollowersOnly={stream.isChatFollowersOnly}
              streamId={stream.id}
              initialMessages={chatMessages}
            />
          </div>
        </div>
      </LiveKitRoom>
    </>
  );
};

export const StreamPlayerSkeleton = () => {
  const { collapsed } = useChatSidebar((state) => state);

  return (
    <div className={cn(
      "grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 h-full",
      collapsed && "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
    )}>
      <div className={cn(
        "col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar pb-10",
        collapsed && "lg:col-span-2 xl:col-span-2 2xl:col-span-2"
      )}>
        <div className="px-4 pt-4">
          <StreamHeaderSkeleton />
        </div>
        <div className="px-4 mt-4">
          <VideoSkeleton />
        </div>
      </div>
      <div className={cn("col-span-1 bg-background", collapsed && "hidden")}>
        <ChatSkeleton />
      </div>
    </div>
  );
};
