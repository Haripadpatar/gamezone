import React from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 border border-indigo-100 shadow-sm">
        <Compass className="h-6 w-6 text-indigo-650" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900">Page not found</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to a new address.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/">
          <Button
            variant="primary"
            size="sm"
            className="cursor-pointer"
          >
            Go Home
          </Button>
        </Link>
        <Link href="/colleges">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 cursor-pointer"
          >
            Browse Colleges
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
