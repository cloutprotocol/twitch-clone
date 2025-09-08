import { db } from "@/lib/db";
import Image from "next/image";

export const DebugResults = async () => {
  try {
    const streams = await db.stream.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        isLive: true,
        title: true,
        thumbnail: true,
        viewerCount: true,
        _count: {
          select: {
            chatMessages: true,
          },
        },
      },
      take: 10,
    });

    return (
      <div className="w-full">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <h2 className="text-2xl font-bold mb-8">Debug: Found {streams.length} streams</h2>
          
          {streams.length === 0 ? (
            <div className="text-center py-16">
              <p>No streams found in database</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
              {streams.map((stream) => (
                <div key={stream.id} className="bg-card rounded-xl overflow-hidden shadow-sm p-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 rounded-lg mb-3 flex items-center justify-center relative group">
                    {/* Live video background for live streams */}
                    {stream.isLive ? (
                      <>
                        {/* This would be where StreamPreview component goes */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 rounded-lg animate-pulse" />
                        <div className="absolute inset-0 bg-black/30 rounded-lg group-hover:bg-black/10 transition-colors" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-muted rounded-lg" />
                    )}
                    
                    {/* User avatar in center - fades on hover for live streams */}
                    <div className={`relative z-10 transition-opacity duration-300 ${
                      stream.isLive ? 'group-hover:opacity-30' : ''
                    }`}>
                      <Image
                        src={stream.user.imageUrl}
                        alt={stream.user.username}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full border-2 border-white/80"
                      />
                      {stream.isLive && (
                        <div className="absolute -top-1 -right-1 bg-status-error text-text-inverse text-xs px-1 rounded">
                          LIVE
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{stream.title}</h3>
                    <p className="text-xs text-text-secondary">{stream.user.username}</p>
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>👁 {stream.viewerCount} viewers</span>
                      <span>💬 {stream._count.chatMessages} messages</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="w-full">
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4 text-status-error">Debug Error</h2>
            <p className="text-text-secondary">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          </div>
        </div>
      </div>
    );
  }
};