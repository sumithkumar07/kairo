
'use client';

import React from 'react';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // TEMPORARILY DISABLED AUTHENTICATION FOR PAGE ACCESS COMPARISON
    // React.useEffect(() => {
    //   if (!isLoading && !user) {
    //     router.push('/login');
    //   }
    // }, [user, isLoading, router]);

    // if (isLoading) {
    //   return (
    //     <div className="flex items-center justify-center h-screen">
    //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    //     </div>
    //   );
    // }

    // if (!user) {
    //   return null;
    // }

    // Always render the component without authentication check
    return <Component {...props} />;
  };
}

    