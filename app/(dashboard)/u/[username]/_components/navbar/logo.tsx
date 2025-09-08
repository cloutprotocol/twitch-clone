import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/theme-utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center gap-x-4 hover:opacity-75 transition">
        <div className="text-2xl mr-12 shrink-0 lg:mr-0 lg:shrink">▣</div>
        <div className={cn("hidden lg:block", font.className)}>
          <p className="text-lg font-semibold">rarecube.tv</p>
        </div>
      </div>
    </Link>
  );
};
