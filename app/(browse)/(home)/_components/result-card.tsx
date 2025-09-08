"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Eye, MessageCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatViewerCount } from "@/lib/format";

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
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(data.thumbnail);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load fresh thumbnail on hover for live streams
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (data.isLive) {
      // For live streams, show live preview after a short delay
      setTimeout(() => {
        if (isHovered) {
          setShowLivePreview(true);
        }
      }, 500); // 500ms delay before showing live preview
      
      // Also refresh thumbnail
      const freshThumbnailUrl = `/api/thumbnail/${data.id}?t=${Date.now()}`;
      setThumbnailUrl(freshThumbnailUrl);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowLivePreview(false);
  };

  // Initialize live preview when needed
  useEffect(() => {
    if (showLivePreview && videoRef.current && data.isLive) {
      // Here you could initialize a lightweight live preview
      // For now, we'll just refresh the thumbnail more frequently
      const interval = setInterval(() => {
        if (showLivePreview) {
          const freshThumbnailUrl = `/api/thumbnail/${data.id}?t=${Date.now()}`;
          setThumbnailUrl(freshThumbnailUrl);
        }
      }, 2000); // Refresh every 2 seconds while hovering

      return () => clearInterval(interval);
    }
  }, [showLivePreview, data.isLive, data.id]);

  return (
    <Link href={`/${data.user.username}`}>
      <div 
        className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 w-full max-w-sm mx-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Container - Always use thumbnails, never live video */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          <div className="relative w-full h-full">
            {(thumbnailUrl || data.thumbnail) && !imageError ? (
              <Image
                src={thumbnailUrl || data.thumbnail || ''}
                alt={data.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority={data.isLive} // Prioritize live stream thumbnails
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
            
            {/* Live preview indicator */}
            {data.isLive && showLivePreview && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                LIVE PREVIEW
              </div>
            )}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-transparent group-hover:bg-background-overlay transition-colors duration-300" />
          
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
                  className="flex items-center space-x-1 bg-black/90 dark:bg-black/80 rounded-full px-3 py-1 text-white text-xs font-medium backdrop-blur-sm shadow-lg"
                />
              )}
              {(data._count?.chatMessages || 0) > 0 && (
                <div className="flex items-center space-x-1 bg-black/90 dark:bg-black/80 rounded-full px-3 py-1 text-white text-xs font-medium backdrop-blur-sm shadow-lg">
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
            <div className="flex-shrink-0">
              <UserAvatar
                username={data.user.username}
                imageUrl={data.user.imageUrl}
                isLive={data.isLive}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {data.title}
              </h3>
              <p className="text-text-secondary text-xs mt-1">
                {data.user.username}
              </p>
              {!data.isLive && data.viewerCount > 0 && (
                <div className="flex items-center space-x-1 text-text-secondary text-xs mt-1">
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
