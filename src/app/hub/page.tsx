'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HubRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated marketplace
    router.replace('/marketplace');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Marketplace...</h1>
        <p className="text-muted-foreground">The Hub has been consolidated into our new Marketplace.</p>
      </div>
    </div>
  );
}