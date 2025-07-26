'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated account page with team tab
    router.replace('/account?tab=team');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Account Management...</h1>
        <p className="text-muted-foreground">Organization settings have been consolidated into Account Management Hub.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          You'll find team and organization management in the unified account center...
        </div>
      </div>
    </div>
  );
}