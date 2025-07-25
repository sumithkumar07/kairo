'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GodTierRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated AI studio page
    router.replace('/ai-studio?tab=god-tier');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to AI Studio...</h1>
        <p className="text-muted-foreground">God-tier features have been consolidated into AI Studio.</p>
      </div>
    </div>
  );
}