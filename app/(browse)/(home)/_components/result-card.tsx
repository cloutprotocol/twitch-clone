"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Eye, MessageCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatViewerCount } from "@/lib/format";
import { StreamPreview } from "@/components/stream-preview";

import { LiveBadge } from "@/components/live-badge";
import { LiveParticipantCount } from "@/components/live-participant-count";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultCardProps {
  data: {
    id: string;
    user: {
      id: string;
      username: string;
      imageUrl: string;
    };
    isLive: boolean;
    title: string;
    thumbnail: string | null;
    viewerCount: number;
    _count: {
      chatMessages: number;
    };
  };
}

export const ResultCard = ({ data }: ResultCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && data.isLive) {
      videoRef.current.play().catch(() => {
        // Fallback to thumbnail if video fails
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const streamUrl = data.isLive ? `/api/stream/${data.id}/preview` : null;

  return (
    <Link href={`/${data.user.username}`}>
      <div 
        className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Video/Thumbnail Container */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {data.isLive ? (
            <>
              {/* Always show live video for live streams */}
              <div className="absolute inset-0 w-full h-full">
                <StreamPreview 
                  hostIdentity={data.user.id}
                  className="w-full h-full"
                  isHovered={isHovered}
                />
              </div>
              
            </>
          ) : (
            /* Static Thumbnail or Avatar for offline streams */
            <div className="relative w-full h-full">
              {data.thumbnail && !imageError ? (
                <img
                  src={data.thumbnail}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50">
                  <UserAvatar
                    username={data.user.username}
                    imageUrl={data.user.imageUrl}
                    isLive={data.isLive}
                    size="lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Play Button */}
          {!data.isLive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/90 rounded-full p-3">
                <Play className="w-6 h-6 text-black fill-black ml-1" />
              </div>
            </div>
          )}

          {/* Live Badge */}
          {data.isLive && (
            <div className="absolute top-3 left-3">
              <LiveBadge />
            </div>
          )}

          {/* Stats Overlay */}
          {(data.isLive || data.viewerCount > 0 || (data._count?.chatMessages || 0) > 0) && (
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              {(data.isLive || data.viewerCount > 0) && (
                <LiveParticipantCount
                  streamId={data.id}
                  isLive={data.isLive}
                  fallbackCount={data.viewerCount || 0}
                  className="flex items-center space-x-1 bg-black/80 rounded-full px-3 py-1 text-white text-xs font-medium backdrop-blur-sm"
                />
              )}
              {(data._count?.chatMessages || 0) > 0 && (
                <div className="flex items-center space-x-1 bg-black/80 rounded-full px-3 py-1 text-white text-xs font-medium backdrop-blur-sm">
                  <MessageCircle className="w-3 h-3" />
                  <span>{formatViewerCount(data._count.chatMessages)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <UserAvatar
              username={data.user.username}
              imageUrl={data.user.imageUrl}
              isLive={data.isLive}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {data.title}
              </h3>
              <p className="text-muted-foreground text-xs mt-1">
                {data.user.username}
              </p>
              {!data.isLive && data.viewerCount > 0 && (
                <div className="flex items-center space-x-1 text-muted-foreground text-xs mt-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewerCount(data.viewerCount)} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ResultCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-sm">
      <div className="aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <UserAvatarSkeleton />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};
