import Link from "next/link";
import { Toggle } from "./toggle";
import { Wrapper } from "./wrapper";
import { Navigation } from "./navigation";
import { SidebarFooter } from "@/components/layout/sidebar-footer";

export const Sidebar = () => {
  return (
    <Wrapper>
      <div className="p-4 border-b border-border-primary">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-interactive-primary rounded-lg flex items-center justify-center">
            <span className="text-text-inverse font-bold text-lg">R</span>
          </div>
          <span className="font-bold text-text-primary text-lg lg:block hidden">rarecube.tv</span>
        </Link>
      </div>
      <Toggle />
      <Navigation />
      <SidebarFooter />
    </Wrapper>
  );
};