import { db } from "@/lib/db";

// Simple thumbnail URL generation (most efficient)
export const getThumbnailUrl = (streamId: string, timestamp?: number) => {
  const ts = timestamp || Date.now();
  return `/api/thumbnail/${streamId}?t=${ts}`;
};

// Update thumbnail URL in database (called when stream goes live)
export const updateStreamThumbnail = async (streamId: string, thumbnailUrl: string) => {
  try {
    await db.stream.update({
      where: { id: streamId },
      data: { thumbnail: thumbnailUrl },
    });
  } catch (error) {
    console.error("Error updating stream thumbnail:", error);
  }
};

// Generate thumbnail from video frame (browser-based, efficient)
export const generateThumbnailFromVideo = (videoElement: HTMLVideoElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = 320; // Small size for efficiency
      canvas.height = 180;
      
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      reject(error);
    }
  });
};

// Cache thumbnails in memory for efficiency
const thumbnailCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedThumbnail = (streamId: string): string | null => {
  const cached = thumbnailCache.get(streamId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }
  return null;
};

export const setCachedThumbnail = (streamId: string, url: string) => {
  thumbnailCache.set(streamId, { url, timestamp: Date.now() });
};

// Cleanup old cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of thumbnailCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      thumbnailCache.delete(key);
    }
  }
}, CACHE_DURATION);