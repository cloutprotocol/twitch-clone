"use client";

import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/theme-utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

interface ContainerProps {
  children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  const { collapsed, onCollapse, onExpand } = useCreatorSidebar(
    (state) => state
  );
  const matches = useMediaQuery(`(max-width: 1024px)`);

  useEffect(() => {
    if (matches) {
      onCollapse();
    } else {
      onExpand();
    }
  }, [matches, onCollapse, onExpand]);

  return (
    <div
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out min-h-0 h-screen",
        // Desktop: proper margins based on sidebar state
        collapsed ? "lg:ml-[70px]" : "lg:ml-60",
        // Mobile: always full width (sidebar is overlay)
        "ml-0"
      )}
    >
      {children}
    </div>
  );
};
