'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickStartRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated help page with quick-start tab
    router.replace('/help?tab=quick-start');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Help Center...</h1>
        <p className="text-muted-foreground">Quick Start guide has been consolidated into Help Center.</p>
      </div>
    </div>
  );
}