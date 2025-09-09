"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useSidebar } from "@/store/use-sidebar";

export const WhitelistLink = () => {
  const { collapsed } = useSidebar((state) => state);

  if (collapsed) {
    return null;
  }

  return (
    <div className="px-2 mb-4">
      <Link
        href="/whitelist"
        className="flex items-center gap-x-3 px-3 py-2 rounded-lg hover:bg-background-secondary transition-colors group"
      >
        <div className="w-8 h-8 bg-interactive-primary/10 border border-interactive-primary/20 rounded-full flex items-center justify-center group-hover:bg-interactive-primary/20 transition-colors">
          <Plus className="h-4 w-4 text-interactive-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary group-hover:text-interactive-primary transition-colors">
            Apply for Whitelist
          </p>
          <p className="text-xs text-text-secondary">
            Start streaming on rarecube.tv
          </p>
        </div>
      </Link>
    </div>
  );
};