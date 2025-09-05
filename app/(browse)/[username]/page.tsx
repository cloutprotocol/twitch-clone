import { notFound } from "next/navigation";

import { getUserByUsername } from "@/lib/user-service";
import { isFollowingUser } from "@/lib/follow-service";
import { isBlockedByUser } from "@/lib/block-service";
import { getChatMessages } from "@/lib/chat-service";
import { StreamPlayer } from "@/components/stream-player";

interface UserPageProps {
  params: {
    username: string;
  };
}

const UserPage = async ({ params }: UserPageProps) => {
  const user = await getUserByUsername(params.username);

  if (!user || !user.stream) {
    notFound();
  }

  // Parallelize these queries for better performance
  const [isFollowing, isBlocked, chatMessages] = await Promise.all([
    isFollowingUser(user.id),
    isBlockedByUser(user.id),
    getChatMessages(user.stream.id).catch(() => []) // Fallback to empty array on error
  ]);

  if (isBlocked) {
    notFound();
  }

  return (
    <StreamPlayer 
      user={user} 
      stream={user.stream} 
      isFollowing={isFollowing}
      chatMessages={chatMessages}
    />
  );
};

export default UserPage;
