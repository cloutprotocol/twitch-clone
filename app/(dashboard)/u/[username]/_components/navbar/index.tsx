import { Logo } from "./logo";
import { Actions } from "./actions";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full h-20 z-[49] bg-[#252731] px-3 sm:px-4 lg:px-6 flex justify-between items-center shadow-sm border-b border-[#2D2E35]">
      <Logo />
      <Actions />
    </nav>
  );
};
