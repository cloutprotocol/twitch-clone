import { useEffect, useCallback } from "react";
import { startAutoThumbnails, stopAutoThumbnails } from "@/lib/thumbnail-service";

interface UseThumbnailManagerProps {
  streamId: string;
  userId: string;
  isLive: boolean;
}

/**
 * Hook to automatically manage thumbnail generation for streams
 * Starts generation when stream goes live, stops when offline
 */
export const useThumbnailManager = ({ streamId, userId, isLive }: UseThumbnailManagerProps) => {
  const startThumbnails = useCallback(async () => {
    if (!isLive) return;
    
    try {
      await startAutoThumbnails(streamId, userId);
      console.log(`Started thumbnails for stream ${streamId}`);
    } catch (error) {
      console.error("Failed to start thumbnails:", error);
    }
  }, [streamId, userId, isLive]);

  const stopThumbnails = useCallback(async () => {
    try {
      await stopAutoThumbnails(streamId);
      console.log(`Stopped thumbnails for stream ${streamId}`);
    } catch (error) {
      console.error("Failed to stop thumbnails:", error);
    }
  }, [streamId]);

  useEffect(() => {
    if (isLive) {
      startThumbnails();
    } else {
      stopThumbnails();
    }

    // Cleanup on unmount
    return () => {
      if (isLive) {
        stopThumbnails();
      }
    };
  }, [isLive, startThumbnails, stopThumbnails]);

  return {
    startThumbnails,
    stopThumbnails
  };
};