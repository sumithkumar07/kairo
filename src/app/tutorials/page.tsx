'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorialsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated learning center with tutorials tab
    router.replace('/learn?tab=tutorials');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Learning Center...</h1>
        <p className="text-muted-foreground">Tutorials have been consolidated into the Learning & Knowledge Center.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          You'll find comprehensive tutorials in the unified learning platform...
        </div>
      </div>
    </div>
  );
}