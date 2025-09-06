"use client";

import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { useCreatorSidebar } from "@/store/use-creator-sidebar";

export const MobileOverlay = () => {
  const { collapsed, onCollapse } = useCreatorSidebar((state) => state);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    // Prevent body scroll when sidebar is open on mobile
    if (isMobile && !collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, collapsed]);

  // Only show overlay on mobile when sidebar is expanded
  if (!isMobile || collapsed) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300"
      onClick={onCollapse}
      style={{ top: "80px" }} // Account for navbar height
    />
  );
};