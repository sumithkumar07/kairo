'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated analytics page with reports tab
    router.replace('/analytics?tab=reports');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Analytics...</h1>
        <p className="text-muted-foreground">Reports have been consolidated into the Analytics Super Dashboard.</p>
      </div>
    </div>
  );
}