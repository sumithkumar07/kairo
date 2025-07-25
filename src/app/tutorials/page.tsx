'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorialsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated academy page
    router.replace('/academy?tab=tutorials');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Academy...</h1>
        <p className="text-muted-foreground">Tutorials have been consolidated into Academy.</p>
      </div>
    </div>
  );
}