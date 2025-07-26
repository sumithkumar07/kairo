'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PermissionsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the consolidated account page with security tab
    router.replace('/account?tab=security');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Account Management...</h1>
        <p className="text-muted-foreground">Permissions have been consolidated into Account Management Hub.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          You'll find comprehensive security settings in the unified account center...
        </div>
      </div>
    </div>
  );
}