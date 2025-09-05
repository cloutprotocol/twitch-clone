"use server";

import { revalidatePath } from "next/cache";
import { createChatMessage, deleteChatMessage, clearChatHistory } from "@/lib/chat-service";
import { getSelf } from "@/lib/auth-service";

export const onSendMessage = async (
  streamId: string,
  content: string,
  username: string,
  userId?: string
) => {
  try {
    if (!content.trim()) {
      throw new Error("Message cannot be empty");
    }

    if (content.length > 500) {
      throw new Error("Message too long");
    }

    const message = await createChatMessage(streamId, content.trim(), username, userId);
    
    // Revalidate the stream page to show new message
    revalidatePath(`/[username]`, 'page');
    
    return message;
  } catch (error) {
    throw new Error("Failed to send message");
  }
};

export const onDeleteMessage = async (messageId: string) => {
  try {
    await deleteChatMessage(messageId);
    
    // Revalidate to remove deleted message
    revalidatePath(`/[username]`, 'page');
    
    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete message");
  }
};

export const onClearChat = async (streamId: string) => {
  try {
    await clearChatHistory(streamId);
    
    // Revalidate to show cleared chat
    revalidatePath(`/[username]`, 'page');
    
    return { success: true };
  } catch (error) {
    throw new Error("Failed to clear chat");
  }
};