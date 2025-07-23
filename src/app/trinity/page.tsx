'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrinityRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated AI Studio
    router.replace('/ai-studio');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to AI Studio...</h1>
        <p className="text-muted-foreground">Divine Powers have been consolidated into our new AI Studio.</p>
      </div>
    </div>
  );
}