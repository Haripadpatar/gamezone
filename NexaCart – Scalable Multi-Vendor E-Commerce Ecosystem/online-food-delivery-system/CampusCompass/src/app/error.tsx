"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global Error Boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
        <AlertTriangle className="h-6 w-6" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Something went wrong!</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          An unexpected error occurred in our system. We have logged this error and are looking into it.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={reset}
          variant="primary"
          size="sm"
          className="gap-1.5 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
        <Button
          onClick={() => window.location.href = "/"}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
