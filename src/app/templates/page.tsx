'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TemplatesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated integrations page with templates tab
    router.replace('/integrations?tab=templates');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Integrations...</h1>
        <p className="text-muted-foreground">Templates have been consolidated into Integrations.</p>
      </div>
    </div>
  );
}