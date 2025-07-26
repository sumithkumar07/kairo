'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowRight, Brain } from 'lucide-react';

function AIStudioRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the AI-native workflow editor
    router.replace('/workflow?tab=assistant');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl inline-block mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">AI Studio is now integrated!</h2>
            <p className="text-muted-foreground mb-4">
              We've consolidated AI features into the workflow editor for a better experience
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>/ai-studio</span>
              <ArrowRight className="h-4 w-4" />
              <span>/workflow (with AI panel)</span>
            </div>
            <div className="mt-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Redirecting to AI-native workflow editor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(AIStudioRedirect);