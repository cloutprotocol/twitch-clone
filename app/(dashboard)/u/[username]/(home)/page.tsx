import { currentUser } from "@clerk/nextjs";

import { getUserByUsername } from "@/lib/user-service";
import { getChatMessages } from "@/lib/chat-service";
import { StreamPlayer } from "@/components/stream-player";

interface CreatorPageProps {
  params: {
    username: string;
  };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const externalUser = await currentUser();
  const user = await getUserByUsername(params.username);

  if (!user || user.externalUserId !== externalUser?.id || !user.stream) {
    throw new Error("Unauthorized");
  }

  // Get chat messages for the stream
  const chatMessages = await getChatMessages(user.stream.id).catch(() => []);

  return (
    <div className="h-full">
      <StreamPlayer 
        user={user} 
        stream={user.stream} 
        isFollowing 
        chatMessages={chatMessages.map(msg => ({
          ...msg,
          userId: msg.userId ?? undefined,
          user: msg.user ?? undefined
        }))}
      />
    </div>
  );
};

export default CreatorPage;
