"use client";

import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/theme-utils";
import { useSidebar } from "@/store/use-sidebar";

interface ContainerProps {
  children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  const matches = useMediaQuery("(max-width: 768px)"); // Changed from 1024px to 768px
  const { collapsed, onCollapse, onExpand } = useSidebar((state) => state);

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
        "flex-1 transition-all duration-300 ease-in-out min-h-screen",
        collapsed ? "ml-[70px]" : "ml-60 xl:ml-80", // Wider sidebar on xl screens
        // Add top margin for floating wallet
        "pt-16 px-4"
      )}
    >
      {children}
    </div>
  );
};
