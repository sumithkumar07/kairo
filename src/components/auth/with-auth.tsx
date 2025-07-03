
'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const { isLoggedIn, isAuthLoading } = useSubscription();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isAuthLoading && !isLoggedIn) {
        router.push(`/login?redirect_url=${pathname}`);
      }
    }, [isLoggedIn, isAuthLoading, router, pathname]);

    if (isAuthLoading || !isLoggedIn) {
      return (
        <AppLayout>
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        </AppLayout>
      );
    }

    return <Component {...props} />;
  };
}
