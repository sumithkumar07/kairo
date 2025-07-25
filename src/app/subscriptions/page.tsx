
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated billing page with subscription tab
    router.replace('/billing?tab=subscription');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Billing...</h1>
        <p className="text-muted-foreground">Subscription management has been consolidated into Billing.</p>
      </div>
    </div>
  );
}
