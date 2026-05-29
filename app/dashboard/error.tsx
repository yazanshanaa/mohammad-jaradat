'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AdminError({
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
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-lg shadow-sm border p-8 text-center">
      <AlertCircle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Panel Error</h2>
      <p className="text-slate-600 mb-6 max-w-lg">
        An unexpected error occurred in the dashboard. This has been logged for the technical team.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="bg-primary hover:bg-primary/90">
          Try Again
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  );
}
