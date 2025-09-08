import { Logo } from "./logo";
import { Actions } from "./actions";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full h-20 z-[49] bg-background-secondary px-3 sm:px-4 lg:px-6 flex justify-between items-center shadow-sm border-b border-border-primary">
      <Logo />
      <Actions />
    </nav>
  );
};
