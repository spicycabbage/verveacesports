"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Try again, or go back to the home page.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
