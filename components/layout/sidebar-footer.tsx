"use client";

import Link from "next/link";
import { Github, Twitter, Globe } from "lucide-react";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";

export const SidebarFooter = () => {
  return (
    <div className="mt-auto p-4 border-t border-border-primary">
      {/* Theme Toggle */}
      <div className="flex justify-center mb-4">
        <TwitchStyleThemeToggle />
      </div>
      
      {/* Social Links */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Link 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Github className="w-4 h-4" />
        </Link>
        <Link 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Twitter className="w-4 h-4" />
        </Link>
        <Link 
          href="https://rarecube.tv" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Globe className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Site Info */}
      <div className="text-center">
        <p className="text-xs text-text-tertiary">
          © 2024 rarecube.tv
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          v1.0.0
        </p>
      </div>
    </div>
  );
};