import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/theme-utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const Logo = () => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="text-5xl">▣</div>
      <div className={cn(font.className, "flex flex-col items-center")}>
        <p 
          className="lowercase"
          style={{
            color: 'hsl(var(--text-primary))',
            fontSize: '2rem',
            lineHeight: '2.5rem',
            letterSpacing: '-1.28px',
            fontWeight: '600'
          }}
        >
          rarecube.tv
        </p>
      </div>
    </div>
  );
};
