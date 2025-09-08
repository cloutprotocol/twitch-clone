/**
 * Example: Refactored Navbar using new theme system
 * Before: hardcoded bg-[#252731]
 * After: semantic theme tokens
 */

import { Logo } from "../(browse)/_components/navbar/logo";
import { Search } from "../(browse)/_components/navbar/search";
import { Actions } from "../(browse)/_components/navbar/actions";
import { cn } from "@/lib/theme-utils";

export const RefactoredNavbar = () => {
  return (
    <nav className={cn(
      // Use semantic background instead of hardcoded color
      "fixed top-0 left-0 w-full h-20 z-49",
      "bg-background-secondary/95 backdrop-blur-sm",
      "border-b border-border-primary",
      "px-2 lg:px-4 flex items-center justify-between",
      "shadow-sm"
    )}>
      <Logo />
      <Search />
      <Actions />
    </nav>
  );
};