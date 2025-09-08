import { Loader } from "lucide-react";

interface LoadingVideoProps {
  label: string;
}

export const LoadingVideo = ({ label }: LoadingVideoProps) => {
  return (
    <div className="h-full flex flex-col space-y-4 justify-center items-center">
      <Loader className="h-10 w-10 text-text-secondary animate-spin" />
      <p className="text-text-secondary capitalize">{label}</p>
    </div>
  );
};
