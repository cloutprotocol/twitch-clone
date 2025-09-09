"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

interface StartStreamCardProps {
  isLoggedIn?: boolean;
  username?: string;
  onWalletConnect?: () => void;
}

export const StartStreamCard = ({ isLoggedIn = false, username, onWalletConnect }: StartStreamCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    // Always redirect to whitelist application page
    router.push("/whitelist");
  };

  return (
    <Card 
      className="group relative overflow-hidden border-2 border-dashed border-border-primary hover:border-interactive-primary transition-all duration-300 cursor-pointer h-full bg-background-secondary/30 hover:bg-background-secondary/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        {/* Ultra Simple Icon */}
        <div className={`w-10 h-10 rounded-full border border-dashed border-interactive-primary/60 flex items-center justify-center transition-all duration-200 ${isHovered ? 'border-interactive-primary' : ''}`}>
          <Play className="w-4 h-4 text-interactive-primary" fill="currentColor" />
        </div>

        {/* Minimal Text */}
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary group-hover:text-interactive-primary transition-colors">
            Start Streaming
          </h3>
          <p className="text-xs text-interactive-primary/70 group-hover:text-interactive-primary transition-colors">
            Apply for Whitelist →
          </p>
        </div>
      </CardContent>
    </Card>
  );
};