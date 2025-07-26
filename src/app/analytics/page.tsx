'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';

function AnalyticsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard with analytics tab
    router.replace('/dashboard?tab=analytics');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Redirecting to Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Analytics has been consolidated into the Command Center
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>/analytics</span>
              <ArrowRight className="h-4 w-4" />
              <span>/dashboard?tab=analytics</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(AnalyticsRedirect);