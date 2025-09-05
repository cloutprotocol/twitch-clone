import { Navbar } from "../_components/navbar";

const BrowseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="flex h-fll">{children}</div>
    </>
  );
};

export default BrowseLayout;
