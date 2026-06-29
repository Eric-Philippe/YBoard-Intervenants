"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// The module details panel has been merged into /modules. This route is kept
// around only to redirect old links/bookmarks (?promoId=&moduleId=) there.
function ModuleDetailsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace(`/modules?${searchParams.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Redirection...</div>
    </div>
  );
}

export default function ModuleDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Redirection...</div>
        </div>
      }
    >
      <ModuleDetailsRedirect />
    </Suspense>
  );
}
