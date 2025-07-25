'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function APIDocsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated docs page with API tab
    router.replace('/docs?tab=api');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Documentation...</h1>
        <p className="text-muted-foreground">API documentation has been consolidated into Documentation.</p>
      </div>
    </div>
  );
}