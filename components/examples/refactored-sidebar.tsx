/**
 * Example: Refactored Sidebar using new theme system
 * Before: hardcoded border-[#2D2E35]
 * After: semantic theme tokens with better responsive behavior
 */

"use client";

import { cn } from "@/lib/theme-utils";
import { useSidebar } from "@/store/use-sidebar";

interface RefactoredSidebarProps {
  children: React.ReactNode;
}

export const RefactoredSidebar = ({ children }: RefactoredSidebarProps) => {
  const { collapsed } = useSidebar((state) => state);

  return (
    <aside
      className={cn(
        // Base styles with semantic tokens
        "fixed left-0 flex flex-col h-full z-50",
        "bg-background-primary border-r border-border-primary",
        "theme-transition",
        
        // Responsive width management
        "w-60",
        collapsed && "w-[70px]",
        
        // Enhanced mobile behavior
        "lg:translate-x-0",
        collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      )}
    >
      {children}
    </aside>
  );
};