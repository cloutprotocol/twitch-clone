import { Suspense } from "react";

import { Results, ResultsSkeleton } from "./_components/results";
import { ThumbnailDebug } from "./_components/thumbnail-debug";

export default function Page() {
  return (
    <div className="min-h-screen w-full">
      {/* Thumbnail System Debug - Remove this in production */}
      <div className="p-4">
        <ThumbnailDebug />
      </div>
      
      <Suspense fallback={<ResultsSkeleton />}>
        <Results />
      </Suspense>
    </div>
  );
}
