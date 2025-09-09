import { Suspense } from "react";

import { Results, ResultsSkeleton } from "./_components/results";

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="min-h-screen w-full">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results />
      </Suspense>
    </div>
  );
}
