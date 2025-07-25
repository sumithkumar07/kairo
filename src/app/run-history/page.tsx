'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RunHistoryRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated reports page
    router.replace('/reports?tab=run-history');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Reports...</h1>
        <p className="text-muted-foreground">Run History has been consolidated into Reports.</p>
      </div>
    </div>
  );
}