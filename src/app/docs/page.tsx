'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated learning center with docs tab
    router.replace('/learn?tab=docs');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Learning Center...</h1>
        <p className="text-muted-foreground">Documentation has been consolidated into the Learning & Knowledge Center.</p>
      </div>
    </div>
  );
}