/**
 * Client-Side Thumbnail Generation
 * 
 * This approach uses the browser's canvas API to capture screenshots
 * from video elements. No server-side recording needed!
 * 
 * Benefits:
 * - No storage costs
 * - Instant thumbnails
 * - No server resources used
 * - Works with any video source
 */

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Generate thumbnail from video element
 */
export const generateThumbnailFromVideo = (
  videoElement: HTMLVideoElement,
  options: ThumbnailOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const {
        width = 320,
        height = 180,
        quality = 0.8,
        format = 'jpeg'
      } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, width, height);
      
      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      }, `image/${format}`, quality);
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate thumbnail and upload to your storage
 */
export const generateAndUploadThumbnail = async (
  videoElement: HTMLVideoElement,
  streamId: string,
  options: ThumbnailOptions = {}
): Promise<string> => {
  try {
    // Generate thumbnail blob
    const thumbnailUrl = await generateThumbnailFromVideo(videoElement, options);
    
    // Convert blob URL to actual blob for upload
    const response = await fetch(thumbnailUrl);
    const blob = await response.blob();
    
    // Upload to your storage (UploadThing, S3, etc.)
    const formData = new FormData();
    formData.append('file', blob, `thumbnail-${streamId}.jpg`);
    formData.append('streamId', streamId);
    
    const uploadResponse = await fetch('/api/upload-thumbnail', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload thumbnail');
    }
    
    const { url } = await uploadResponse.json();
    
    // Clean up blob URL
    URL.revokeObjectURL(thumbnailUrl);
    
    return url;
    
  } catch (error) {
    console.error('Failed to generate and upload thumbnail:', error);
    throw error;
  }
};

/**
 * Auto-generate thumbnails at intervals (client-side)
 */
export class ThumbnailGenerator {
  private videoElement: HTMLVideoElement;
  private streamId: string;
  private interval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private lastThumbnailTime = 0;

  constructor(videoElement: HTMLVideoElement, streamId: string, intervalSeconds = 30) {
    this.videoElement = videoElement;
    this.streamId = streamId;
    this.interval = intervalSeconds * 1000;
  }

  start() {
    if (this.intervalId) return; // Already running

    this.intervalId = setInterval(async () => {
      try {
        // Only generate if video is playing and enough time has passed
        if (!this.videoElement.paused && 
            Date.now() - this.lastThumbnailTime > this.interval) {
          
          await this.generateThumbnail();
          this.lastThumbnailTime = Date.now();
        }
      } catch (error) {
        console.error('Auto thumbnail generation failed:', error);
      }
    }, this.interval);

    console.log(`Started auto thumbnail generation for stream ${this.streamId}`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`Stopped auto thumbnail generation for stream ${this.streamId}`);
    }
  }

  private async generateThumbnail() {
    try {
      const thumbnailUrl = await generateAndUploadThumbnail(
        this.videoElement,
        this.streamId,
        { width: 1280, height: 720, quality: 0.9 }
      );

      // Update database with new thumbnail
      await fetch('/api/update-stream-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamId: this.streamId,
          thumbnailUrl
        })
      });

      // Silent success - only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🖼️ Auto-generated thumbnail for stream ${this.streamId}`);
      }
      
    } catch (error) {
      // Silent failure - only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Auto thumbnail generation failed:', error);
      }
    }
  }
}