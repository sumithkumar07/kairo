'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MonitoringRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated analytics page with monitoring tab
    router.replace('/analytics?tab=monitoring');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Analytics Super Dashboard...</h1>
        <p className="text-muted-foreground">Monitoring has been consolidated into the Analytics Super Dashboard.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          You'll find comprehensive monitoring in the unified analytics platform...
        </div>
      </div>
    </div>
  );
}