import { Logo } from "./logo";
import { Actions } from "./actions";

export const Navbar = () => {
  return (
    <nav className="h-20 bg-background-secondary px-3 sm:px-4 lg:px-6 flex items-center shadow-sm border-b border-l border-border-primary">
      <Actions />
    </nav>
  );
};
