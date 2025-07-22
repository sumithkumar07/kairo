'use client';

import { useSubscription } from '@/contexts/SubscriptionContext';
import TrinityDashboard from '@/components/trinity/trinity-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TrinityPage() {
  const { isLoggedIn } = useSubscription();

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-fit mx-auto">
              <Crown className="h-12 w-12 text-white" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Divine Powers Await
              </h1>
              <p className="text-muted-foreground text-lg">
                The Trinity of Divine Domination requires divine authentication to prevent mortals from accessing godlike powers.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Link href="/login">
                  <Zap className="h-5 w-5 mr-2" />
                  Ascend to Divinity
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">
                  Begin Divine Trial
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TrinityDashboard />
    </div>
  );
}