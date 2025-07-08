'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Loader2 } from 'lucide-react';

// This component is a temporary redirect to handle the old /mcp route.
// It will redirect users to the new /agent-hub route.
export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agent-hub');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to the AI Agent Hub...</p>
        </div>
      </div>
    </AppLayout>
  );
}
