'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiDocsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated learning center with API tab
    router.replace('/learn?tab=api');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Learning Center...</h1>
        <p className="text-muted-foreground">API Documentation has been consolidated into the Learning & Knowledge Center.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          You'll find comprehensive API references in the unified learning platform...
        </div>
      </div>
    </div>
  );
}