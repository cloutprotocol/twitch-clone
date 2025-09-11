import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { getUserByUsername } from "@/lib/user-service";
import { getChatMessages } from "@/lib/chat-service";
import { StreamPlayer } from "@/components/stream-player";

interface CreatorPageProps {
  params: {
    username: string;
  };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const session = await getServerSession(authOptions);
  const user = await getUserByUsername(params.username);

  if (!user || !session || user.username !== session.user.username || !user.stream) {
    throw new Error("Unauthorized");
  }

  // Get chat messages for the stream
  const chatMessages = await getChatMessages(user.stream.id).catch(() => []);

  return (
    <div className="h-full bg-transparent">
      <StreamPlayer 
        user={user} 
        stream={user.stream} 
        isFollowing 
        isOwner={true}
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
