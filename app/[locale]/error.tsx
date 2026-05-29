'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full mb-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">حدث خطأ ما!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        نعتذر عن هذا الخلل. لقد تم تسجيل الخطأ وجاري العمل على إصلاحه.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          <RefreshCcw className="mr-2 h-4 w-4" />
          إعادة المحاولة
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}
