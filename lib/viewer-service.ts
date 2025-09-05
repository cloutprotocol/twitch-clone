import { db } from "@/lib/db";

export const updateViewerCount = async (streamId: string, count: number) => {
  try {
    await db.stream.update({
      where: { id: streamId },
      data: { viewerCount: count },
    });
  } catch (error) {
    console.error("Error updating viewer count:", error);
  }
};

export const incrementViewerCount = async (streamId: string) => {
  try {
    await db.stream.update({
      where: { id: streamId },
      data: { viewerCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Error incrementing viewer count:", error);
  }
};

export const decrementViewerCount = async (streamId: string) => {
  try {
    await db.stream.update({
      where: { id: streamId },
      data: { viewerCount: { decrement: 1 } },
    });
  } catch (error) {
    console.error("Error decrementing viewer count:", error);
  }
};

export const getStreamViewerCount = async (streamId: string) => {
  try {
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: { viewerCount: true },
    });
    return stream?.viewerCount || 0;
  } catch (error) {
    console.error("Error getting viewer count:", error);
    return 0;
  }
};

