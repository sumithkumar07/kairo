'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the new consolidated account page with billing tab
    router.replace('/account?tab=billing');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Account...</h1>
        <p className="text-muted-foreground">Billing has been consolidated into the Account Management Hub.</p>
      </div>
    </div>
  );
}