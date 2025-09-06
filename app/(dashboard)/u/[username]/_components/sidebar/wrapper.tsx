"use client";

import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

interface WrapperProps {
  children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
  const { collapsed } = useCreatorSidebar((state) => state);

  return (
    <aside
      className={cn(
        "fixed left-0 flex flex-col h-full bg-background border-r border-[#2D2E35] z-50 transition-all duration-300 ease-in-out",
        // Desktop behavior
        "lg:w-60 lg:translate-x-0",
        collapsed && "lg:w-[70px]",
        // Mobile behavior - always full width when visible, hidden when collapsed
        "w-64 md:w-60",
        collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      )}
    >
      {children}
    </aside>
  );
};
