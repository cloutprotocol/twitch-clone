"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { UserDropdown } from "@/components/auth/user-dropdown";

export const Actions = () => {
  const { data: session } = useSession();
  const { collapsed, onExpand, onCollapse } = useCreatorSidebar((state) => state);

  const handleMenuClick = () => {
    if (collapsed) {
      onExpand();
    } else {
      onCollapse();
    }
  };

  return (
    <div className="flex items-center justify-end gap-x-2">
      {/* Mobile menu button - only show on mobile */}
      <Button
        size="sm"
        variant="ghost"
        className="lg:hidden p-2"
        onClick={handleMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-primary hidden sm:flex"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5 mr-2" />
          Exit
        </Link>
      </Button>
      
      {/* Mobile-only exit button without text */}
      <Button
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-primary sm:hidden p-2"
        asChild
      >
        <Link href="/">
          <LogOut className="h-5 w-5" />
        </Link>
      </Button>
      
      {session?.user && (
        <UserDropdown user={session.user} />
      )}
    </div>
  );
};
