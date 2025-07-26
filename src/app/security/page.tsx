'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated account page with security tab
    router.replace('/account?tab=security');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Account...</h1>
        <p className="text-muted-foreground">Security settings have been consolidated into the Account Management Hub.</p>
      </div>
    </div>
  );
}