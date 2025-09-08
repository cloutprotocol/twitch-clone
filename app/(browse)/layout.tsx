import { Suspense } from "react";

import { Sidebar, SidebarSkeleton } from "./_components/sidebar";
import { Container } from "./_components/container";
import { FloatingWallet } from "@/components/layout/floating-wallet";

const BrowseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex h-full">
        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar />
        </Suspense>
        <Container>{children}</Container>
        <FloatingWallet />
      </div>
    </>
  );
};

export default BrowseLayout;
