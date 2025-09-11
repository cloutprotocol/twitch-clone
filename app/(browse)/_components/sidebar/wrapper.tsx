"use client";

import { useIsClient } from "usehooks-ts";

import { cn } from "@/lib/theme-utils";
import { useSidebar } from "@/store/use-sidebar";

import { ToggleSkeleton } from "./toggle";
import { FollowingSkeleton } from "./following";
import { RecommendedSkeleton } from "./recommended";

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
  const isClient = useIsClient();
  const { collapsed } = useSidebar((state) => state);

  if (!isClient) {
    return (
      <aside className="fixed left-0 flex flex-col w-[70px] md:w-60 xl:w-80 h-full bg-background border-r border-border-primary z-50">
        <ToggleSkeleton />
        <FollowingSkeleton />
        <RecommendedSkeleton />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 flex flex-col w-60 xl:w-80 h-full bg-background border-r border-border-primary z-50 transition-all duration-300",
        collapsed && "w-[70px]"
      )}
    >
      {children}
    </aside>
  );
};
