import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getChatMessages = async (streamId: string, limit: number = 50) => {
  try {
    const messages = await db.chatMessage.findMany({
      where: {
        streamId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return []; // Return empty array on error
  }
};

export const createChatMessage = async (
  streamId: string,
  content: string,
  username: string,
  userId?: string
) => {
  const message = await db.chatMessage.create({
    data: {
      content,
      username,
      userId,
      streamId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
        },
      },
    },
  });

  return message;
};

export const deleteChatMessage = async (messageId: string) => {
  try {
    const self = await getSelf();
    
    const message = await db.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        stream: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Only allow deletion by message author or stream owner
    if (message.userId !== self.id && message.stream.userId !== self.id) {
      throw new Error("Unauthorized");
    }

    await db.chatMessage.delete({
      where: { id: messageId },
    });

    return true;
  } catch {
    throw new Error("Failed to delete message");
  }
};

export const clearChatHistory = async (streamId: string) => {
  try {
    const self = await getSelf();
    
    // Verify user owns the stream
    const stream = await db.stream.findUnique({
      where: { id: streamId },
      select: { userId: true },
    });

    if (!stream || stream.userId !== self.id) {
      throw new Error("Unauthorized");
    }

    await db.chatMessage.deleteMany({
      where: { streamId },
    });

    return true;
  } catch {
    throw new Error("Failed to clear chat history");
  }
};