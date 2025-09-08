"use server";

import { Stream } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { startAutoThumbnails, stopAutoThumbnails } from "@/lib/thumbnail-service";

export const updateStream = async (values: Partial<Stream>) => {
  try {
    const self = await getSelf();
    const selfStream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!selfStream) {
      throw new Error("Stream not found");
    }

    const validData = {
      thumbnail: values.thumbnail,
      title: values.title,
      isChatEnabled: values.isChatEnabled,
      isChatFollowersOnly: values.isChatFollowersOnly,
      isChatDelayed: values.isChatDelayed,
    };

    const stream = await db.stream.update({
      where: {
        id: selfStream.id,
      },
      data: {
        ...validData,
      },
    });

    // Batch revalidation to reduce overhead
    revalidatePath(`/u/${self.username}`, 'layout');
    revalidatePath(`/${self.username}`);

    return stream;
  } catch {
    throw new Error("Internal Error");
  }
};
/**
 * Update stream live status and manage thumbnails
 */
export const updateStreamStatus = async (streamId: string, isLive: boolean) => {
  try {
    const self = await getSelf();
    
    // Update stream status
    const stream = await db.stream.update({
      where: {
        id: streamId,
        userId: self.id, // Ensure user owns the stream
      },
      data: {
        isLive,
        updatedAt: new Date(),
      },
    });

    // Manage thumbnail generation based on live status
    if (isLive) {
      // Start automatic thumbnail generation
      await startAutoThumbnails(streamId, self.id);
    } else {
      // Stop thumbnail generation when stream ends
      await stopAutoThumbnails(streamId);
    }

    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);
    revalidatePath('/');

    return stream;
  } catch (error) {
    console.error("Failed to update stream status:", error);
    throw new Error("Failed to update stream status");
  }
};

/**
 * Get stream with fresh thumbnail
 */
export const getStreamWithThumbnail = async (streamId: string) => {
  try {
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          }
        }
      }
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    // For live streams, ensure we have a recent thumbnail
    if (stream.isLive && (!stream.thumbnail || isOldThumbnail(stream.updatedAt))) {
      // Trigger thumbnail generation if needed
      startAutoThumbnails(streamId, stream.userId).catch(console.error);
    }

    return stream;
  } catch (error) {
    console.error("Failed to get stream:", error);
    throw new Error("Failed to get stream");
  }
};

// Helper to check if thumbnail is old (older than 5 minutes)
function isOldThumbnail(updatedAt: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return updatedAt < fiveMinutesAgo;
}