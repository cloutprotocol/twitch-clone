"use client";

import Link from "next/link";
import { Github, Twitter, MessageCircle } from "lucide-react";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";
import { useSidebar } from "@/store/use-sidebar";

export const SidebarFooter = () => {
  const { collapsed } = useSidebar((state) => state);

  return (
    <div className="mt-auto p-2 lg:p-4 border-t border-border-primary">
      {/* Theme Toggle */}
      <div className="flex justify-center mb-2 lg:mb-4">
        <TwitchStyleThemeToggle />
      </div>
      
      {/* Social Links */}
      <div className={`flex items-center justify-center mb-2 lg:mb-4 ${
        collapsed ? 'flex-col space-y-2' : 'space-x-3 lg:space-x-4'
      }`}>
        <Link 
          href="https://github.com/rarecubetv" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
          aria-label="GitHub"
        >
          <Github className="w-4 h-4" />
        </Link>
        <Link 
          href="https://x.com/RareCubeTV" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
          aria-label="Twitter/X"
        >
          <Twitter className="w-4 h-4" />
        </Link>
        <Link 
          href="https://discord.gg/3tjgBXMx" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
          aria-label="Discord"
        >
          <MessageCircle className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Site Info - Only show when expanded */}
      {!collapsed && (
        <div className="text-center lg:block hidden">
          <p className="text-xs text-text-tertiary">
            © 2024 rarecube.tv
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            v1.0.0
          </p>
        </div>
      )}
    </div>
  );
};