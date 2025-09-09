import Link from "next/link";
import { getFollowedUsers } from "@/lib/follow-service";
import { getRecommended } from "@/lib/recommended-service";

import { Wrapper } from "./wrapper";
import { Following, FollowingSkeleton } from "./following";
import { Toggle, ToggleSkeleton } from "./toggle";
import { Recommended, RecommendedSkeleton } from "./recommended";
import { LiveStreamers, LiveStreamersSkeleton } from "./live-streamers";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

export const Sidebar = async () => {
  // Parallelize sidebar data fetching with error handling
  let recommended: any[] = [];
  let following: any[] = [];
  
  try {
    [recommended, following] = await Promise.all([
      getRecommended(),
      getFollowedUsers()
    ]);
  } catch (error) {
    console.error("Error loading sidebar data:", error);
    // Use fallback empty arrays
    recommended = [];
    following = [];
  }

  return (
    <Wrapper>
      <div className="p-4 border-b border-border-primary">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-interactive-primary rounded-lg flex items-center justify-center">
            <span className="text-text-inverse font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-text-primary text-lg lg:block hidden">rarecube.tv</span>
        </Link>
      </div>
      <Toggle />
      <div className="space-y-4 pt-4 lg:pt-0 flex-1">
        <LiveStreamers />
        <Following data={following} />
        <Recommended data={recommended} />
      </div>
      <SidebarFooter />
    </Wrapper>
  );
};

export const SidebarSkeleton = () => {
  return (
    <aside className="fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-border-primary z-50">
      <div className="p-4 border-b border-border-primary">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-background-tertiary rounded-lg animate-pulse"></div>
          <div className="h-4 bg-background-tertiary rounded animate-pulse lg:block hidden w-24"></div>
        </div>
      </div>
      <ToggleSkeleton />
      <div className="flex-1">
        <LiveStreamersSkeleton />
        <FollowingSkeleton />
        <RecommendedSkeleton />
      </div>
      <div className="mt-auto p-4 border-t border-border-primary">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 bg-background-tertiary rounded animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-4 h-4 bg-background-tertiary rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-background-tertiary rounded animate-pulse"></div>
          <div className="w-4 h-4 bg-background-tertiary rounded animate-pulse"></div>
        </div>
        <div className="text-center">
          <div className="h-3 bg-background-tertiary rounded animate-pulse mb-1"></div>
          <div className="h-3 bg-background-tertiary rounded animate-pulse w-12 mx-auto"></div>
        </div>
      </div>
    </aside>
  );
};
