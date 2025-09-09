"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Fullscreen, KeyRound, MessageSquare, Users, Rocket, Shield } from "lucide-react";

import { NavItem, NavItemSkeleton } from "./nav-item";
import { isAdmin } from "@/lib/admin";

export const Navigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const routes = [
    {
      label: "Stream",
      href: `/u/${user?.username}`,
      icon: Fullscreen,
    },
    {
      label: "Launch",
      href: `/u/${user?.username}/launch`,
      icon: Rocket,
    },
    {
      label: "Keys",
      href: `/u/${user?.username}/keys`,
      icon: KeyRound,
    },
    {
      label: "Chat",
      href: `/u/${user?.username}/chat`,
      icon: MessageSquare,
    },
    {
      label: "Community",
      href: `/u/${user?.username}/community`,
      icon: Users,
    },
  ];

  // Add admin routes if user is admin
  const adminRoutes = isAdmin(user?.email, user?.id) ? [
    {
      label: "Whitelist Admin",
      href: "/admin/whitelist",
      icon: Shield,
    },
  ] : [];

  const allRoutes = [...routes, ...adminRoutes];

  if (!user?.username) {
    return (
      <ul className="space-y-2 px-2">
        {[...Array(4)].map((_, i) => (
          <NavItemSkeleton key={i} />
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2 px-2 pt-4 lg:pt-0 pb-4">
      {routes.map((route) => (
        <NavItem
          key={route.href}
          label={route.label}
          icon={route.icon}
          href={route.href}
          isActive={pathname === route.href}
        />
      ))}
    </ul>
  );
};
